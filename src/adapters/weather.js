import {inForecastWindow,validWeather} from '../modules/course-weather.js';
export function createWeatherProvider({mode='sample',fetcher=fetch,now=()=>new Date()}={}){
 return {async forecast({station,date,signal}){
  const base={date,stationId:station.id,stationName:station.name,nearby:station.nearby,mode,fetchedAt:now().toISOString(),slots:[]};
  signal?.throwIfAborted();if(!inForecastWindow(date,now()))return {...base,status:'unavailable'};
  if(mode!=='live')return {...base,status:'ready',slots:[9,12,15,18,21].map((hour,i)=>({time:String(hour).padStart(2,'0')+':00',sky:['1','2','3','rain','4'][i],temperature:22+i%3,pop:[0,10,20,70,30][i]}))};
  const response=await fetcher('/api/weather/forecast?'+new URLSearchParams({station:station.id,date}),{signal});
  if(!response.ok)throw Error('날씨를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  const {data}=await response.json();if(!validWeather(data)||data.date!==date||data.stationId!==station.id||data.mode!=='live')throw Error('날씨 정보를 확인할 수 없습니다.');return {...data,nearby:station.nearby};
 }};
}
