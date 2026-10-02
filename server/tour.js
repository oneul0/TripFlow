import {createTourApiCatalog,areas,types} from '../src/adapters/catalog.js';
import {tourFilters} from '../src/adapters/tour-codes.js';
import {createViewportCatalog,validViewport} from '../src/adapters/viewport-catalog.js';
export function createTourHandler({key='',fetcher=fetch}={}){
 return async(req,res,next)=>{
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/api/tour/'))return next();
  const send=(status,body)=>{res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(body));};
  if(!['/api/tour/list','/api/tour/preview','/api/tour/page','/api/tour/viewport'].includes(url.pathname))return send(404,{error:'지원하지 않는 요청입니다.'});
  if(req.method!=='GET')return send(405,{error:'지원하지 않는 요청입니다.'});
  if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)return send(403,{error:'허용되지 않은 요청입니다.'});
  if([...url.searchParams].some(([k,v])=>!['area','type','large','middle','small','pageNo','west','east','south','north'].includes(k)||v.length>100||url.searchParams.getAll(k).length>1))return send(400,{error:'검색 조건을 확인해주세요.'});
  const p=Object.fromEntries(url.searchParams),filters={pageNo:p.pageNo?Number(p.pageNo):1,area:p.area||'',type:p.type||'',classification:{large:p.large||'',middle:p.middle||'',small:p.small||''}};
  if(!Number.isInteger(filters.pageNo)||filters.pageNo<1||filters.pageNo>100000)return send(400,{error:'페이지 번호를 확인해주세요.'});
  if(!areas[filters.area])return send(400,{error:'실시간 관광정보를 조회할 지역을 선택해주세요.'});
  const bounds=Object.fromEntries(['west','east','south','north'].map(k=>[k,p[k]?.trim()?Number(p[k]):NaN]));
  if(url.pathname.endsWith('/viewport')&&!validViewport(bounds))return send(400,{error:'지도 범위를 확인해주세요.'});
  try{if(filters.type&&!types[filters.type])throw Error();tourFilters(filters);}catch{return send(400,{error:'검색 조건을 확인해주세요.'});}
  if(!key.trim())return send(503,{error:'서버에 관광 API 키 설정이 필요합니다.'});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  res.on('close',()=>controller.abort());
  try{
   const catalog=createTourApiCatalog({key,fetcher});
   const data=url.pathname.endsWith('/viewport')?await createViewportCatalog({key,fetcher})({...filters,bounds,signal:controller.signal}):await catalog[url.pathname.endsWith('/preview')?'preview':url.pathname.endsWith('/page')?'page':'list']({...filters,signal:controller.signal});
   send(200,{data});
  }catch{send(502,{error:'관광정보를 불러오지 못했습니다. 지역과 유형을 좁히거나 잠시 후 다시 시도해주세요.'});}
  finally{clearTimeout(timer);}
 };
}
