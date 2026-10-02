import stations from '../data/weather-stations.json' with {type:'json'};
export {stations};
export const koreaDate=(now=new Date())=>new Date(now.getTime()+9*3600000).toISOString().slice(0,10);
export const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function inForecastWindow(date,now=new Date()){if(!validDate(date))return false;const days=(Date.parse(date)-Date.parse(koreaDate(now)))/86400000;return days>=0&&days<=2;}
const clean=name=>String(name||'').replace(/^\([^)]*\)/,'').replace(/\s/g,'');
const regions={'11':'1','28':'2','30':'3','27':'4','29':'5','26':'6','31':'7','36':'8','41':'31','42':'32','51':'32','43':'33','44':'34','47':'35','48':'36','45':'37','52':'37','46':'38','50':'39'};
export function resolveStation(stop,list=stations){
 if(!stop)return null;
 if(Number.isFinite(stop.latitude)&&Number.isFinite(stop.longitude)){
  const rad=Math.PI/180,lat=stop.latitude*rad;
  const nearest=list.map(s=>{const a=Math.sin((s.lat-stop.latitude)*rad/2)**2+Math.cos(lat)*Math.cos(s.lat*rad)*Math.sin((s.lon-stop.longitude)*rad/2)**2;return {...s,distanceKm:6371*2*Math.asin(Math.min(1,Math.sqrt(a)))};}).sort((a,b)=>a.distanceKm-b.distanceKm)[0];
  return nearest?.distanceKm<=5?{...nearest,nearby:true}:null;
 }
 const found=list.filter(s=>clean(s.name)===clean(stop.title)&&regions[s.region.slice(0,2)]===stop.area);
 const points=new Set(found.map(s=>s.lat+','+s.lon));return points.size===1?{...found[0],nearby:false}:null;
}
export function weatherSymbol(sky){return ({'1':{emoji:'☀️',label:'맑음'},'2':{emoji:'🌤️',label:'구름 조금'},'3':{emoji:'⛅',label:'구름 많음'},'4':{emoji:'☁️',label:'흐림'},rain:{emoji:'☔',label:'강수'}})[sky]||{emoji:'❔',label:'미확인'};}
const numeric=(v,min,max)=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v))&&Number(v)>=min&&Number(v)<=max?Number(v):null;
export function normalizeForecast(rows,station,date){
 const slots=new Map();for(const row of rows){
  if(String(row.courseId)!==station.course||clean(row.spotName)!==clean(station.name)||String(row.spotAreaId)!==station.id)continue;
  const tm=String(row.tm??'').replace(/[- :T]/g,'');if(!/^\d{10}(\d{2})?$/.test(tm)||tm.slice(0,8)!==date.replaceAll('-',''))continue;
  const hour=Number(tm.slice(8,10));if(hour>23||(tm.length===12&&tm.slice(10)!=='00'))continue;
  const time=String(hour).padStart(2,'0')+':00';const rn=numeric(row.rn,0,1000);
  const sky=rn!==null&&rn>0?'rain':['1','2','3','4'].includes(String(row.sky))?String(row.sky):'unknown';
  slots.set(time,{time,sky,temperature:numeric(row.th3,-60,60),pop:numeric(row.pop,0,100)});
 }return [...slots.values()].sort((a,b)=>a.time.localeCompare(b.time)).slice(0,8);
}
export function validWeather(w){return !!w&&validDate(w.date)&&typeof w.stationId==='string'&&typeof w.stationName==='string'&&w.stationName.length<=200&&['ready','empty','unavailable','error'].includes(w.status)&&['sample','live'].includes(w.mode)&&typeof w.fetchedAt==='string'&&Number.isFinite(Date.parse(w.fetchedAt))&&Array.isArray(w.slots)&&w.slots.length<=8&&new Set(w.slots.map(s=>s.time)).size===w.slots.length&&w.slots.every(s=>/^([01]\d|2[0-3]):00$/.test(s.time)&&['1','2','3','4','rain','unknown'].includes(s.sky)&&(s.temperature===null||typeof s.temperature==='number'&&s.temperature>=-60&&s.temperature<=60)&&(s.pop===null||typeof s.pop==='number'&&s.pop>=0&&s.pop<=100));}

