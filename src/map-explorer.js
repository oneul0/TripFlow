import {seoulBoundaryCatalog} from './adapters/boundaries.js';
import {createRegionExplorer,insideBounds} from './modules/regions.js';
import {createSvgMap} from './maps/svg-map.js';
import {createKakaoMap} from './maps/kakao-map.js';
export function mountExplorer(root,{mapMode='sample',mapKey='',onRegionChange,onPlaceChange,onScopeChange}={}){
 const boundaries=seoulBoundaryCatalog.list(),explorer=createRegionExplorer(boundaries);
 root.innerHTML=`<div class="map-heading"><div><p class="eyebrow">FOLLOW THE GLOW</p><h3>빛나는 곳으로, 서울.</h3><p>여행지가 모인 구역을 눌러 다음 발견을 찾아보세요.</p></div><span class="map-mode">서울 25개 구</span></div>
 <div class="map-layout"><div class="map-stage"><div id="map-surface"></div><div class="map-toolbar"><button id="all-regions" type="button">서울 전체 ↖</button><button id="scope-search" type="button" hidden>이 지도 범위에서 찾기</button></div><div class="map-legend"><span>적음</span><i></i><span>많음</span><small>조회된 관광정보 개수 · 인기도 아님</small></div></div>
 <aside class="region-panel" aria-label="지역 탐색"><p class="eyebrow">YOUR NEXT NEIGHBORHOOD</p><h4 id="region-title">서울의 작은 발견</h4><p id="region-summary" role="status"></p><div id="map-detail" aria-live="polite">지도 마커나 목록의 지도 버튼을 눌러 장소를 선택하세요.</div><label for="district-select">구 선택</label><select id="district-select" class="form-select"><option value="">서울 전체</option></select><div id="district-list" class="district-list"></div></aside></div>
 <div class="map-notice"><span id="map-status" role="status"></span><button id="retry-map" type="button" hidden>지도 재시도</button></div><p class="map-source">경계: KOSTAT 2013 단순화 · southkorea/seoul-maps · 최신 행정경계가 아닌 개발 기준 데이터</p>`;
 const surface=root.querySelector('#map-surface'),status=root.querySelector('#map-status'),retry=root.querySelector('#retry-map'),scopeButton=root.querySelector('#scope-search'),select=root.querySelector('#district-select');
 const buttons=new Map();
 for(const region of boundaries.slice().sort((a,b)=>a.name.localeCompare(b.name,'ko'))){
  const option=new Option(region.name,region.id);select.add(option);
  const button=document.createElement('button');button.type='button';button.dataset.selectRegion=region.id;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>chooseRegion(region.id));buttons.set(region.id,button);root.querySelector('#district-list').append(button);
 }
 let analysis=explorer.analyze([]),selectedRegion=null,selectedPlace=null,bounds=null,view,dead=false,connecting=false,lastArea='',queryState='loading';
 const callbacks={regions:boundaries,onRegion:chooseRegion,onPlace:choosePlace,onMove(){if(view?.getBounds())scopeButton.hidden=false;}};
 view=createSvgMap(surface,callbacks);
 function render(){
  const visible=analysis.select(selectedRegion).filter(p=>!bounds||insideBounds(p,bounds));
  const region=analysis.regions.find(r=>r.id===selectedRegion);
  root.querySelector('#region-title').textContent=region?region.name:'서울의 작은 발견';
  root.setAttribute('aria-busy',String(queryState==='loading'));
  root.querySelector('#region-summary').textContent=queryState==='loading'?'관광정보 조회 중…':queryState==='error'?'조회 실패 · 지역별 개수 미확인. 검색을 다시 시도해주세요.':`현재 조회 ${analysis.places.length}개 · 서울 지도 표시 ${analysis.regions.reduce((n,r)=>n+r.count,0)}개${analysis.unmapped?` · 좌표 없음/서울 경계 밖 ${analysis.unmapped}개`:''}${bounds?` · 선택 범위 ${visible.length}개`:''}`;
  select.value=selectedRegion||'';
  for(const r of analysis.regions){const button=buttons.get(r.id);button.textContent=`${r.name} ${queryState==='ready'?`${r.count}개`:'미확인'}`;button.disabled=queryState==='loading';button.setAttribute('aria-pressed',String(selectedRegion===r.id));}
  select.disabled=queryState==='loading';
  view.update({regions:analysis.regions,selectedRegion,selectedPlace});
  const place=analysis.places.find(p=>p.contentId===selectedPlace);
  const detail=root.querySelector('#map-detail');detail.replaceChildren();
  if(place){const title=document.createElement('strong'),address=document.createElement('span');title.textContent=place.title;address.textContent=place.address||'주소 정보 없음';detail.append(title,address);}else detail.textContent=region?`${region.name}에서 ${visible.length}개의 조회 결과를 탐색하세요.`:'지도 마커나 목록의 지도 버튼을 눌러 장소를 선택하세요.';
  return visible;
 }
 function chooseRegion(id){
  if(queryState==='loading')return;
  selectedRegion=id||null;selectedPlace=null;bounds=null;scopeButton.hidden=true;render();view.focusRegion(selectedRegion);onRegionChange?.(selectedRegion);
 }
 function choosePlace(id){
  if(!analysis.regionOf(id))return;
  selectedPlace=id;render();const place=analysis.places.find(p=>p.contentId===id);view.focusPlace(place);onPlaceChange?.(id);
 }
 async function connect(){
  if(mapMode!=='kakao'){status.textContent='샘플 경계 지도 · 합성 데이터로 효과를 미리 봅니다.';return;}
  if(connecting||dead)return;connecting=true;retry.hidden=true;delete status.dataset.failure;status.textContent='카카오 지도를 불러오고 있습니다…';
  try{
   // Load in a separate surface so SDK failure never destroys the usable preview.
   const nextSurface=document.createElement('div');nextSurface.className='map-connection';surface.append(nextSurface);
   let next;
   try{next=await createKakaoMap(nextSurface,{...callbacks,key:mapKey});}catch(error){nextSurface.remove();throw error;}
   if(dead){next.destroy();return;}
   view.destroy();surface.append(nextSurface);view=next;render();if(selectedRegion)view.focusRegion(selectedRegion);
   status.textContent='카카오 지도 · 밝기는 현재 조회 결과 기준입니다.';root.querySelector('.map-mode').textContent='KAKAO MAP · 서울';
  }catch(error){status.dataset.failure=error.name==='MapConfigurationError'?'configuration':error.name==='MapSdkError'?'sdk':'render';status.textContent='카카오 지도를 연결하지 못했습니다. JavaScript 키와 SDK 도메인 설정을 확인해주세요. 목록과 샘플 지도는 계속 사용할 수 있습니다.';retry.hidden=false;}
  finally{connecting=false;}
 }
 root.querySelector('#all-regions').addEventListener('click',()=>chooseRegion(null));select.addEventListener('change',()=>chooseRegion(select.value));retry.addEventListener('click',connect);
 scopeButton.addEventListener('click',()=>{bounds=view.getBounds();scopeButton.hidden=true;selectedPlace=null;render();onScopeChange?.();});
 render();connect();
 return {update(places,{area=''}={}){queryState='ready';if(area!==lastArea&&area!=='1'){selectedRegion=null;bounds=null;selectedPlace=null;}lastArea=area;analysis=explorer.analyze(places);if(!analysis.regionOf(selectedPlace))selectedPlace=null;return render();},setQueryState(next){queryState=next;if(next==='error'){analysis=explorer.analyze([]);selectedPlace=null;}render();},visible:()=>analysis.select(selectedRegion).filter(p=>!bounds||insideBounds(p,bounds)),choosePlace,hasPlace:id=>Boolean(analysis.regionOf(id)),get selectedPlace(){return selectedPlace;},clearSelection(){selectedRegion=null;selectedPlace=null;bounds=null;scopeButton.hidden=true;render();},destroy(){dead=true;view.destroy();}};
}
