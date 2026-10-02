import {boundsOf,polygonsOf} from '../modules/regions.js';
import {paintDensity} from './density-canvas.js';
let pending;
export function loadKakaoSdk({key,document:doc=document,timeoutMs=10000}={}){
 if(!key?.trim())return Promise.reject(Object.assign(Error('카카오 JavaScript 키를 설정해주세요.'),{name:'MapConfigurationError'}));
 if(globalThis.kakao?.maps?.Map)return Promise.resolve(globalThis.kakao.maps);
 if(pending)return pending;
 pending=new Promise((resolve,reject)=>{
  const script=doc.createElement('script');script.dataset.kakaoSdk='';script.async=true;
  const url=new URL('https://dapi.kakao.com/v2/maps/sdk.js');url.search=new URLSearchParams({appkey:key,autoload:'false',libraries:'clusterer'}).toString();script.src=url.href;
  const fail=()=>{clearTimeout(timer);script.remove();pending=undefined;reject(Object.assign(Error('지도를 불러오지 못했습니다. 키와 도메인 설정을 확인해주세요.'),{name:'MapSdkError'}));};
  const timer=setTimeout(fail,timeoutMs);script.onerror=fail;
  script.onload=()=>{try{globalThis.kakao.maps.load(()=>{if(!globalThis.kakao.maps.Map){fail();return;}clearTimeout(timer);resolve(globalThis.kakao.maps);});}catch{fail();}};
  doc.head.append(script);
 });
 return pending;
}
export async function createKakaoMap(container,{key,regions,onRegion,onPlace,onMove,maps:provided}){
 const maps=provided||await loadKakaoSdk({key});
 const surface=document.createElement('div');surface.className='kakao-surface';
 const canvas=document.createElement('canvas');canvas.className='density-layer';canvas.setAttribute('aria-hidden','true');
 container.replaceChildren(surface,canvas);
 const map=new maps.Map(surface,{center:new maps.LatLng(37.5665,126.978),level:8});
 const clusterer=new maps.MarkerClusterer({map,averageCenter:true,minLevel:7});
 let state={regions:regions.map(r=>({...r,places:[],count:0,intensity:0})),selectedRegion:null,selectedPlace:null},markers=[],polygons=[],listeners=[],dead=false,frame;
 const listen=(target,name,fn)=>{maps.event.addListener(target,name,fn);listeners.push(()=>maps.event.removeListener(target,name,fn));};
 const selection=document.createElement('div');selection.className='selected-map-label';
 const selectedOverlay=new maps.CustomOverlay({content:selection,yAnchor:1.7,zIndex:5});
 const offscreen=document.createElement('canvas');
 function draw(){
  if(dead)return;
  const w=container.clientWidth,h=container.clientHeight,dpr=Math.min(globalThis.devicePixelRatio||1,2);
  if(!w||!h)return;
  canvas.width=offscreen.width=Math.round(w*dpr);canvas.height=offscreen.height=Math.round(h*dpr);
  const ctx=canvas.getContext('2d'),scratch=offscreen.getContext('2d');if(!ctx||!scratch)return;
  scratch.setTransform(dpr,0,0,dpr,0,0);
  const projection=map.getProjection();
  paintDensity(scratch,state.regions,([lon,lat])=>{const p=projection.containerPointFromCoords(new maps.LatLng(lat,lon));return [p.x,p.y];},{width:w,height:h});
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=.48;ctx.drawImage(offscreen,0,0);
 }
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);}
 function fit(items){const b=boundsOf(items);map.setBounds(new maps.LatLngBounds(new maps.LatLng(b.south,b.west),new maps.LatLng(b.north,b.east)),24,24,24,24);schedule();}
 function update(next){
  state=next;
  // Geometry is immutable, so keep polygon listeners instead of duplicating them on every filter.
  if(!polygons.length)for(const region of regions){
   for(const rings of polygonsOf(region.geometry)){
    const polygon=new maps.Polygon({map,path:rings.map(r=>r.map(([lon,lat])=>new maps.LatLng(lat,lon))),strokeColor:'#7041d9',strokeWeight:1.5,strokeOpacity:.7,fillColor:'#a991dd',fillOpacity:.12});
    listen(polygon,'click',()=>onRegion(region.id));polygons.push({regionId:region.id,polygon});
   }
  }
  for(const {regionId,polygon} of polygons){const r=next.regions.find(r=>r.id===regionId),selected=regionId===next.selectedRegion;
   polygon.setOptions({strokeColor:selected?'#7b34d5':'#7041d9',strokeWeight:selected?4:1.5,fillColor:'#ac80de',fillOpacity:.06+(r?.intensity||0)*.22});
  }
  clusterer.clear();for(const {marker,handler} of markers)maps.event.removeListener(marker,'click',handler);markers=[];
  for(const region of next.regions)for(const place of region.places){
   if(next.selectedRegion&&region.id!==next.selectedRegion)continue;
   const marker=new maps.Marker({position:new maps.LatLng(place.latitude,place.longitude),title:place.title});const handler=()=>onPlace(place.contentId);maps.event.addListener(marker,'click',handler);markers.push({marker,handler});
  }
  clusterer.addMarkers(markers.map(m=>m.marker));
  const chosen=next.regions.flatMap(r=>r.places).find(p=>p.contentId===next.selectedPlace);
  if(chosen){selection.textContent=chosen.title;selectedOverlay.setPosition(new maps.LatLng(chosen.latitude,chosen.longitude));selectedOverlay.setMap(map);}else selectedOverlay.setMap(null);
  schedule();
 }
 listen(map,'bounds_changed',schedule);listen(map,'zoom_start',()=>{canvas.style.visibility='hidden';});
 listen(map,'idle',()=>{canvas.style.visibility='';schedule();onMove?.();});
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(()=>{map.relayout();schedule();}):null;resize?.observe(container);
 update(state);fit(regions);
 return {update,focusRegion(id){fit(id?regions.filter(r=>r.id===id):regions);},focusPlace(place){map.panTo(new maps.LatLng(place.latitude,place.longitude));},getBounds(){const b=map.getBounds(),sw=b.getSouthWest(),ne=b.getNorthEast();return {west:sw.getLng(),south:sw.getLat(),east:ne.getLng(),north:ne.getLat()};},destroy(){dead=true;cancelAnimationFrame(frame);resize?.disconnect();listeners.forEach(off=>off());for(const {marker,handler} of markers)maps.event.removeListener(marker,'click',handler);clusterer.clear();polygons.forEach(({polygon})=>polygon.setMap(null));selectedOverlay.setMap(null);container.replaceChildren();}};
}
