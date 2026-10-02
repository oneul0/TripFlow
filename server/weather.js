import {stations,validDate,inForecastWindow,normalizeForecast} from '../src/modules/course-weather.js';
export function createWeatherHandler({key='',baseUrl='https://apis.data.go.kr/1360000/TourStnInfoService1',fetcher=fetch,now=()=>new Date()}={}){
 return async(req,res,next)=>{
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/api/weather/'))return next();
  const send=(status,body)=>{if(res.destroyed)return;res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));};
  if(url.pathname!=='/api/weather/forecast')return send(404,{error:'지원하지 않는 요청입니다.'});
  if(req.method!=='GET')return send(405,{error:'지원하지 않는 요청입니다.'});
  if(req.headers.origin&&!['http://'+req.headers.host,'https://'+req.headers.host].includes(req.headers.origin))return send(403,{error:'허용되지 않은 요청입니다.'});
  if([...url.searchParams].some(([k,v])=>!['station','date'].includes(k)||v.length>30||url.searchParams.getAll(k).length!==1))return send(400,{error:'조회 조건을 확인해주세요.'});
  const station=stations.find(s=>s.id===url.searchParams.get('station')),date=url.searchParams.get('date');
  if(!station||!validDate(date))return send(400,{error:'날짜와 장소를 확인해주세요.'});
  const base={date,stationId:station.id,stationName:station.name,mode:'live',fetchedAt:now().toISOString(),slots:[]};
  if(!inForecastWindow(date,now()))return send(200,{data:{...base,status:'unavailable'}});
  if(!key.trim())return send(503,{error:'날씨 서비스를 준비하고 있습니다.'});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);res.on('close',()=>controller.abort());
  try{
   const baseUrlObject=new URL(baseUrl);if(baseUrlObject.origin!=='https://apis.data.go.kr'||baseUrlObject.pathname.replace(/\/$/,'')!=='/1360000/TourStnInfoService1'||baseUrlObject.search||baseUrlObject.hash||baseUrlObject.username||baseUrlObject.password)throw Error('configuration');
   const rows=[];let total=Infinity;
   for(let pageNo=1;rows.length<total;pageNo++){
    if(pageNo>5)throw Error('limit');
    const endpoint=new URL('https://apis.data.go.kr/1360000/TourStnInfoService1/getTourStnVilageFcst1');endpoint.search=new URLSearchParams({serviceKey:key,pageNo:String(pageNo),numOfRows:'1000',dataType:'JSON',CURRENT_DATE:date.replaceAll('-','')+'00',HOUR:'24',COURSE_ID:station.course});
    const response=await fetcher(endpoint,{signal:controller.signal});if(!response.ok)throw Error('upstream');const data=(await response.json()).response;
    if(String(data?.header?.resultCode)==='03'){total=rows.length;break;}if(!['00','0000'].includes(String(data?.header?.resultCode)))throw Error('upstream');
    total=Number(data.body?.totalCount);if(!Number.isInteger(total)||total<0||total>5000)throw Error('count');
    const items=data.body?.items?.item;const page=Array.isArray(items)?items:items?[items]:[];if(total>rows.length&&!page.length)throw Error('partial');rows.push(...page);
   }
   const slots=normalizeForecast(rows,station,date);send(200,{data:{...base,status:slots.length?'ready':'empty',slots}});
  }catch{send(502,{error:'날씨를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'});}finally{clearTimeout(timer);}
 };
}
