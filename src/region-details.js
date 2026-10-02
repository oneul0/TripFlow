import {createSampleCatalog,areas} from './adapters/catalog.js';
import {createSvgMap} from './maps/svg-map.js';
import {createKakaoMap} from './maps/kakao-map.js';
import {validPosition} from './modules/regions.js';

export function mountRegionDetails(root,{tourPreview=createSampleCatalog().preview,mapMode='sample',mapKey='',mapFactory=createKakaoMap,onClose}={}){
 root.hidden=true;
 root.innerHTML='<div class="random-detail-heading"><div><p class="eyebrow">EXPLORE YOUR PICK</p><h3 data-region-heading></h3><p data-detail-note></p></div><button type="button" data-close-details>상세 닫기</button></div><p data-tour-status role="status"></p><button type="button" data-tour-retry hidden>관광정보 재시도</button><p data-map-status role="status"></p><button type="button" data-map-retry hidden>카카오지도 재시도</button><div class="random-detail-layout"><div data-region-map class="random-detail-map"></div><ul data-tour-list></ul></div>';
 const $=selector=>root.querySelector(selector),surface=$('[data-region-map]');let current,controller,revision=0,map,dead=false,places=[];
 const state=()=>({regions:[{...current,places:places.filter(validPosition),count:places.length,intensity:0}],selectedRegion:current.id,selectedPlace:null});
 function choose(id){const place=places.find(p=>p.contentId===id);if(!place)return;map?.update({...state(),selectedPlace:id});map?.focusPlace(place);for(const row of $('[data-tour-list]').children)row.classList.toggle('selected',row.dataset.id===id);}
 async function loadMap(token){
  map?.destroy();map=null;$('[data-map-retry]').hidden=true;
  const options={key:mapKey,regions:[current],onRegion:()=>{},onPlace:choose,onMove:()=>{}};
  if(mapMode!=='kakao'){$('[data-map-status]').textContent='경계 미리보기 · 카카오지도는 지도/실연동 모드에서 제공됩니다.';map=createSvgMap(surface,options);map.update(state());return;}
  $('[data-map-status]').textContent='카카오지도를 불러오는 중…';
  // Each initialization owns its host so an obsolete SDK response cannot replace a newer map.
  const host=document.createElement('div');host.className='random-kakao-host';surface.replaceChildren(host);
  try{const next=await mapFactory(host,options);if(dead||token!==revision){next.destroy();return;}map=next;map.update(state());$('[data-map-status]').textContent='카카오지도 · 선택 지역 경계와 관광지 마커';}
  catch{if(dead||token!==revision)return;$('[data-map-status]').textContent='카카오지도를 불러오지 못했습니다. 공개 JavaScript 키와 도메인 설정을 확인해주세요.';$('[data-map-retry]').hidden=false;map=createSvgMap(surface,options);map.update(state());}
 }
 async function loadPlaces(token){
  controller?.abort();controller=new AbortController();$('[data-tour-list]').replaceChildren();$('[data-tour-retry]').hidden=true;$('[data-tour-status]').textContent='관광정보를 불러오는 중…';
  try{const result=await tourPreview({area:current.areaCode,signal:controller.signal});if(dead||token!==revision)return;places=result.places;
   $('[data-tour-status]').textContent=`${result.mode==='sample'?'합성 샘플':'한국관광공사 공공데이터'} · ${places.length?`${places.length}개 표시${result.partial?' · 일부 조회':''}`:'조회 결과가 없습니다.'}`;
   for(const place of places){const li=document.createElement('li');li.dataset.id=place.contentId;const title=document.createElement('strong'),address=document.createElement('p');title.textContent=place.title;address.textContent=place.address||'주소 정보 없음';li.append(title,address);
    if(validPosition(place)){const button=document.createElement('button');button.type='button';button.textContent='지도에서 보기';button.addEventListener('click',()=>choose(place.contentId));const link=document.createElement('a');link.textContent='카카오 길찾기 ↗';link.href=`https://map.kakao.com/link/to/${encodeURIComponent(place.title)},${place.latitude},${place.longitude}`;link.target='_blank';link.rel='noopener noreferrer';li.append(button,link);}else{const note=document.createElement('small');note.textContent='좌표 미제공';li.append(note);}$('[data-tour-list]').append(li);
   }map?.update(state());
  }catch(error){if(dead||token!==revision||error.name==='AbortError')return;places=[];$('[data-tour-status]').textContent='관광정보를 불러오지 못했습니다. 다시 시도해주세요.';$('[data-tour-retry]').hidden=false;map?.update(state());}
 }
 function close(){revision++;controller?.abort();map?.destroy();map=null;root.hidden=true;}
 $('[data-close-details]').onclick=()=>{close();onClose?.();};$('[data-tour-retry]').onclick=()=>{const token=++revision;loadMap(token);loadPlaces(token);};$('[data-map-retry]').onclick=()=>loadMap(revision);
 return {close,show(region){current=region;places=[];root.hidden=false;$('[data-region-heading]').textContent=region.path||region.name;$('[data-detail-note]').textContent=`${areas[region.areaCode]||'선택 시도'} 전체 관광정보 미리보기 · 최대 20개. 선택한 시군구·읍면동 내부 목록으로 한정하지 않습니다. 경계: 2013년.`;const token=++revision;loadMap(token);loadPlaces(token);},destroy(){dead=true;close();root.replaceChildren();}};
}
