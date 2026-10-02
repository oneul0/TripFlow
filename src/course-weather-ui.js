import {resolveStation,validWeather,validDate,weatherSymbol} from './modules/course-weather.js';
import {createWeatherProvider} from './adapters/weather.js';
import {esc} from './course-block-ui.js';
export const weatherNotice=status=>({unavailable:'이 날짜는 현재 예보 제공 범위 밖입니다. 여행일이 가까워지면 다시 확인해주세요.',empty:'선택한 날짜에 제공된 예보가 없습니다.',error:'날씨를 불러오지 못했습니다. 다시 시도해주세요.'})[status]||'날씨 정보가 없습니다.';
export function weatherHTML(w){
 if(!validWeather(w))return '<p>날씨 정보가 없습니다.</p>';
 const meta=`${w.mode==='sample'?'샘플 예보':'기상청'} · 첫 방문지 ${w.nearby?'주변 ':''}기준 · ${esc(w.stationName)}`;
 return `<p class="weather-caption">${meta}</p>${w.status==='ready'?`<ol class="weather-timeline" aria-label="3시간별 날씨">${w.slots.map(s=>{const icon=weatherSymbol(s.sky);return `<li><time>${s.time}</time><span class="weather-emoji" role="img" aria-label="${icon.label}">${icon.emoji}</span><strong>${s.temperature===null?'미확인':s.temperature+'°'}</strong><small>${icon.label}</small><small>강수 ${s.pop===null?'미확인':s.pop+'%'}</small></li>`;}).join('')}</ol><p class="weather-caption">3시간 간격 · 한국시간 · 조회 ${esc(new Date(w.fetchedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))}</p>`:`<p role="status">${weatherNotice(w.status)}</p>`}`;
}
export function mountCourseWeather(root,{draft,provider=createWeatherProvider(),onDate,onResult,onBusy}){
 const station=resolveStation(draft.stops[0]),date=draft.input.tripDate||'',events=new AbortController();let dead=false,controller;
 root.innerHTML=`<div class="weather-heading"><div><p class="eyebrow">WEATHER FOR YOUR DAY</p><h3>여행하는 날의 하늘</h3></div><label>여행 날짜<input type="date" data-trip-date value="${esc(date)}"></label></div><div data-weather-content></div><button type="button" data-weather-retry hidden>날씨 다시 조회</button>`;
 const body=root.querySelector('[data-weather-content]'),retry=root.querySelector('[data-weather-retry]');
 root.querySelector('input').addEventListener('change',e=>{if(!e.target.value||validDate(e.target.value))onDate(e.target.value);},{signal:events.signal});
 function paint(w){body.innerHTML=weatherHTML(w);retry.hidden=false;}
 async function load(){controller?.abort();controller=new AbortController();onBusy(true);retry.hidden=true;body.innerHTML='<p role="status">여행지 날씨를 불러오고 있어요…</p>';
  try{const w=await provider.forecast({station,date,signal:controller.signal});if(dead)return;onResult(w);paint(w);}
  catch(error){if(dead||error.name==='AbortError')return;const w={date,stationId:station.id,stationName:station.name,nearby:station.nearby,mode:'live',fetchedAt:new Date().toISOString(),slots:[],status:'error'};onResult(w);paint(w);}
  finally{if(!dead)onBusy(false);}
 }
 retry.addEventListener('click',load,{signal:events.signal});
 if(!date)body.innerHTML='<p>여행 날짜를 선택하면 그날의 예보를 확인할 수 있어요.</p>';
 else if(!station)body.innerHTML=`<p>${draft.stops.length?'첫 방문지와 연결할 수 있는 기상청 예보 지점이 없습니다.':'코스에 첫 장소를 추가하면 날씨가 나타나요.'}</p>`;
 else if(validWeather(draft.input.weather)&&draft.input.weather.date===date&&draft.input.weather.stationId===station.id)paint(draft.input.weather);
 else load();
 return {destroy(){dead=true;controller?.abort();events.abort();}};
}
