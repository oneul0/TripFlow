import {nationalRegions} from './adapters/national-boundaries.js';
import {createThrowCamera,createBallScene} from './maps/throw-scene.js';
import {mountRegionDetails} from './region-details.js';
import {boundsOf,polygonsOf} from './modules/regions.js';
import {simulateThrow,gestureThrow,gestureSpin,hitRegion,createCandidateBag} from './modules/random-trip.js';

const ns='http://www.w3.org/2000/svg';
function svgNode(name,attributes={}){const el=document.createElementNS(ns,name);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,value);return el;}
export function mountRandomTrip(root,{regions=nationalRegions,tourPreview,mapMode='sample',mapKey='',bagContainer,detailsContainer,onDetailsOpen,onDetailsClose,storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)},reducedMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}={}){
 const bag=createCandidateBag(storage),events=new AbortController();
 root.classList.add('random-trip');
 root.innerHTML=`<div class="random-heading"><div><p class="eyebrow">A LITTLE SPIN. A NEW TRIP.</p><h2>다음 여행은, 손끝에서.</h2><p>공을 돌리고, 위로 쓸어 던져보세요.<br>공이 닿은 동네가 다음 여행의 시작.</p></div><a href="#random-bag" class="random-bag-link">여행 후보 <strong data-count>0</strong> ↗</a></div>
 <div class="random-layout"><div class="random-play"><div class="random-toolbar"><label>던질 범위 <select data-scope><option value="">대한민국 전체</option></select></label><label>시·군·구 <select data-city disabled><option value="">시도 먼저 선택</option></select></label><label>지역 단위 <select data-level aria-label="착지 지역 단위"><option value="province">시·도</option><option value="city">시·군·구</option><option value="town" disabled>읍·면·동 · 시군구 선택 후</option></select></label><button type="button" data-back>전국으로 ↖</button><div class="random-zoom"><button type="button" data-zoom="-1" aria-label="랜덤 지도 축소">−</button><output data-zoom-label>1.0×</output><button type="button" data-zoom="1" aria-label="랜덤 지도 확대">+</button></div></div>
 <div class="random-stage"><svg viewBox="0 0 800 600" aria-label="공을 던지는 서울 행정지역 지도"><defs><radialGradient id="travel-ball-fill" cx="32%" cy="25%"><stop offset="0" stop-color="#fff8d9"/><stop offset=".4" stop-color="#ffc568"/><stop offset="1" stop-color="#dc703c"/></radialGradient></defs><g data-shapes></g><path data-trail fill="none" stroke="#efb85f" stroke-width="3" stroke-dasharray="4 8" opacity=".65" pointer-events="none"/><ellipse data-shadow cx="400" cy="550" rx="25" ry="7" fill="#142f2b" opacity=".22" pointer-events="none"/><g data-ball transform="translate(400 550)" style="cursor:grab"><circle r="30" fill="transparent"/><circle r="22" fill="url(#travel-ball-fill)" stroke="#fff4d3" stroke-width="2"/><path d="M-18 -8 Q0 14 18 -8 M-18 8 Q0 -14 18 8" fill="none" stroke="#8c4426" stroke-width="2"/><circle r="5" fill="#fff6d4"/><title>공을 잡고 돌린 뒤 위로 쓸어 던지세요</title></g></svg><span class="random-stage-note">SCROLL TO EXPLORE · SWIPE TO THROW</span><span data-spin class="random-spin">SPIN 0</span></div>
 <p data-status role="status" aria-live="polite" class="random-status">공을 잡아 위로 던지거나 아래 조절 버튼을 사용하세요.</p><p data-availability class="random-source"></p>
 <fieldset class="random-controls"><legend>버튼으로 던지기</legend><label>방향 <input data-direction type="range" min="-60" max="60" value="0"><output data-direction-value>0°</output></label><label>세기 <input data-power type="range" min="80" max="350" value="220"><output data-power-value>220</output></label><label>스핀 <input data-spin-input type="range" min="-6" max="6" step=".5" value="0"><output data-spin-value>0</output></label><button type="button" data-throw>공 던지기 ↗</button></fieldset>
 <p class="random-source">전국 17개 시도 · 251개 시군구 · 3,482개 읍면동. KOSTAT 2013 경계·당시 명칭 기준이며 최신 행정구역과 다를 수 있습니다. 제주·도서 지역 포함. 지역 위에서 확대하면 하위 지역을 탐색합니다.</p></div>
 <aside id="random-bag" class="random-bag" aria-label="여행 후보함"><p class="eyebrow">YOUR NEXT STOPS</p><h3>마음 가는 곳, 모아두기.</h3><p>이 브라우저에 보관하는 여행 후보입니다.</p><ul data-candidates></ul><button type="button" data-undo disabled>마지막 변경 취소</button><div data-storage role="status"></div></aside></div>`;
 const bagElement=root.querySelector('#random-bag');
 const $=selector=>root.querySelector(selector)||bagElement.querySelector(selector),svg=$('svg'),scope=$('[data-scope]'),status=$('[data-status]'),ball=$('[data-ball]'),shadow=$('[data-shadow]'),trail=$('[data-trail]');
 if(bagContainer){bagContainer.append(bagElement);root.classList.add('random-standalone');root.querySelector('.random-bag-link').href='#candidates';}
 svg.setAttribute('aria-label','공을 던지는 전국 행정지역 지도');svg.classList.add('random-ground-svg');
 ball.replaceChildren(svgNode('circle',{r:48,fill:'transparent'}));
 const view=createThrowCamera(),scene=createBallScene($('.random-stage'),view),level=$('[data-level]'),city=$('[data-city]'),hierarchical=regions.some(r=>r.level);
 const board=svgNode('g',{'pointer-events':'none'});svg.insertBefore(board,$('[data-shapes]'));
 const floor=points=>points.map(([x,y],i)=>{const p=view.project({x,y,z:0});return `${i?'L':'M'}${p.x} ${p.y}`;}).join(' ');
 board.append(svgNode('path',{d:floor([[-50,-230],[850,-230],[850,640],[-50,640]])+'Z',fill:'#c8dbce',stroke:'#9bb8a3','stroke-width':1}));
 for(let y=-200;y<640;y+=120)board.append(svgNode('path',{d:floor([[-50,y],[850,y]]),fill:'none',stroke:'#b2c9b9','stroke-width':.7}));
 for(let x=0;x<=800;x+=160)board.append(svgNode('path',{d:floor([[x,-230],[x,640]]),fill:'none',stroke:'#b2c9b9','stroke-width':.7}));
 const detailsRoot=document.createElement('section');detailsRoot.className='random-region-details';(detailsContainer||root).append(detailsRoot);const details=mountRegionDetails(detailsRoot,{tourPreview,mapMode,mapKey,onClose:onDetailsClose});
 const on=(el,name,handler,options={})=>el.addEventListener(name,handler,{signal:events.signal,...options});
 for(const region of hierarchical?regions.filter(r=>r.level==='province'):regions){const option=document.createElement('option');option.value=region.id;option.textContent=region.name;scope.append(option);}
 if(!hierarchical){level.replaceChildren(new Option('시·군·구','city'));}
 let zoom=1,selected=null,busy=false,drag=null,frameId=0,dead=false,projection,flight=0,pinching=false;
 const pointers=new Map();let pinchDistance=0;
 const activeRegions=()=>hierarchical?regions.filter(r=>r.level===level.value&&(!scope.value||r.provinceId===scope.value)&&(!city.value||r.cityId===city.value)):scope.value?regions.filter(r=>r.id===scope.value):regions;
 function setProvince(id){scope.value=id;city.replaceChildren(new Option(id?'시군구 전체':'시도 먼저 선택',''));for(const r of regions.filter(r=>r.level==='city'&&r.provinceId===id))city.append(new Option(r.name,r.id));city.disabled=!id;level.querySelector('[value="town"]')?.setAttribute('disabled','');city.value='';level.value=hierarchical?(id?'city':'province'):'city';zoom=1;renderMap();lock();home();}
 function drill(hit){if(!hierarchical){scope.value=hit.id;zoom=1;}else if(hit.level==='province')setProvince(hit.id);else if(hit.level==='city'){setProvince(hit.provinceId);city.value=hit.id;level.querySelector('[value="town"]').disabled=false;level.value='town';zoom=1;}else return;renderMap();lock();home();}
 function lock(){const full=activeRegions().every(r=>bag.items.some(i=>i.id===r.id));$('[data-availability]').textContent=full?'이 범위의 지역을 모두 담았어요. 범위를 바꾸거나 후보를 삭제해 다시 던져보세요.':'';for(const el of root.querySelectorAll('.random-toolbar select,.random-toolbar button,.random-controls input'))el.disabled=busy||!!drag;city.disabled=busy||!!drag||!scope.value||!hierarchical;const townOption=level.querySelector('[value="town"]');if(townOption)townOption.disabled=!city.value;$('[data-throw]').disabled=busy||!!drag||full||bag.error==='read';$('[data-undo]').disabled=busy||!!drag||!bag.canUndo;for(const el of root.querySelectorAll('[data-remove]'))el.disabled=busy||!!drag;}
 function renderMap(){
  const bounds=boundsOf(activeRegions()),lonScale=Math.cos((bounds.north+bounds.south)/2*Math.PI/180);
  const scale=Math.min(760/((bounds.east-bounds.west)*lonScale),650/(bounds.north-bounds.south))*zoom;
  projection={cx:(bounds.west+bounds.east)/2,cy:(bounds.south+bounds.north)/2,scale,lonScale};
  const project=([x,y])=>{const p=view.project({x:400+(x-projection.cx)*scale*lonScale,y:190-(y-projection.cy)*scale,z:0});return [p.x,p.y];};
  const group=$('[data-shapes]');group.replaceChildren();
  for(const region of activeRegions()){
   const d=polygonsOf(region.geometry).map(rings=>rings.map(ring=>ring.map((p,i)=>`${i?'L':'M'}${project(p).join(',')}`).join(' ')+'Z').join(' ')).join(' ');
   const path=svgNode('path',{d,'fill-rule':'evenodd',class:'random-region','data-id':region.id,'data-selected':String(selected===region.id)});
   const title=svgNode('title');title.textContent=region.name;path.append(title);group.append(path);
   if(activeRegions().length<=80){const b=boundsOf([region]),[x,y]=project([(b.west+b.east)/2,(b.north+b.south)/2]);const label=svgNode('text',{x,y,'text-anchor':'middle','pointer-events':'none',class:'random-region-label'});label.textContent=region.level==='province'?region.name.replace(/특별자치도|특별자치시|특별시|광역시|도$/g,''):region.name;group.append(label);}
  }
  $('[data-zoom-label]').textContent=`${zoom.toFixed(1)}×`;
 }
 function drawBall(point,rotation=0){const screen=view.project({...point,z:point.z+25}),ground=view.project({...point,z:0});ball.setAttribute('transform',`translate(${screen.x} ${screen.y}) scale(${screen.scale})`);ball.dataset.rotation=String(rotation);scene.draw(point,rotation);shadow.setAttribute('cx',ground.x);shadow.setAttribute('cy',ground.y);shadow.setAttribute('rx',Math.max(10,28-point.z*.05)*ground.scale);shadow.setAttribute('ry',7*ground.scale);shadow.setAttribute('opacity',Math.max(.08,.25-point.z*.001));}
 function home(){drawBall({x:400,y:550,z:0});trail.setAttribute('d','');$('[data-spin]').textContent='SPIN 0';}
 function renderBag(){
  $('[data-count]').textContent=bag.items.length;const list=$('[data-candidates]');list.replaceChildren();
  if(!bag.items.length){const item=document.createElement('li');item.className='random-empty';item.textContent='아직 담은 지역이 없어요. 첫 여행 후보를 던져 찾아보세요.';list.append(item);}
  for(const item of bag.items){const li=document.createElement('li'),text=document.createElement('span'),button=document.createElement('button'),explore=document.createElement('button');text.textContent=item.path+(item.boundaryVersion!=='KOSTAT-2013'||!regions.some(r=>r.id===item.id)?' · 현재 경계 확인 필요':'');button.type='button';button.dataset.remove=item.id;button.textContent='삭제';button.setAttribute('aria-label',`${item.path} 후보 삭제`);explore.type='button';explore.dataset.details=item.id;explore.textContent='관광정보';explore.setAttribute('aria-label',`${item.path} 관광정보 보기`);li.append(text,explore,button);list.append(li);}
  const warning=$('[data-storage]');warning.replaceChildren();if(bag.error){const text=document.createElement('p'),button=document.createElement('button');button.type='button';if(bag.error==='read'){text.textContent='후보를 복원하지 못했습니다. 초기화하면 기존 저장 내용을 지웁니다.';button.dataset.resetBag='';button.textContent='손상된 후보함 초기화';}else{text.textContent='기기에 저장하지 못했습니다. 현재 후보는 새로고침하면 사라질 수 있습니다.';button.dataset.retry='';button.textContent='저장 재시도';}warning.append(text,button);}
  lock();
 }
 function cancel(message='던지기를 취소했습니다. 다시 던져보세요.'){
  const active=busy||drag;flight++;cancelAnimationFrame(frameId);busy=false;drag=null;pointers.clear();pinching=false;home();lock();if(active)status.textContent=message;
 }
 function launch(input){
  if(dead||busy||bag.error==='read'||activeRegions().every(r=>bag.items.some(i=>i.id===r.id)))return;
  const points=simulateThrow(input),token=++flight;busy=true;lock();status.textContent='공이 날아가고 있어요…';$('[data-spin]').textContent=`SPIN ${input.spin>0?'↻':input.spin<0?'↺':''} ${Math.abs(input.spin).toFixed(1)}`;
  function finish(){
   if(dead||token!==flight)return;busy=false;const last=points.at(-1);drawBall(last);
   const coordinates=[projection.cx+(last.x-400)/(projection.scale*projection.lonScale),projection.cy-(last.y-190)/projection.scale];
   const hit=last.x>=0&&last.x<=800&&last.y>=0&&last.y<=600?hitRegion(coordinates,activeRegions()):null;
   if(hit){selected=hit.id;const added=bag.add(hit);status.textContent=added?(bag.error?'후보함에 담았지만 기기 저장에 실패했습니다.':`${hit.path||hit.name} — 여행 후보함에 담았어요!`):`${hit.name} — 이미 담은 지역이에요.`;}else{selected=null;status.textContent='지역을 맞히지 못했어요. 방향과 세기를 바꿔 다시 던져보세요.';}
   renderMap();renderBag();home();
  }
  if(reducedMotion()){finish();return;}
  let start;
  function animate(now){if(dead||token!==flight)return;start??=now;const elapsed=(now-start)/1000,index=Math.min(points.length-1,Math.floor(elapsed*120));const point=points[index];drawBall(point,input.spin*elapsed*100);trail.setAttribute('d',points.slice(0,index+1).filter((_,i)=>i%4===0).map((p,i)=>{const q=view.project({...p,z:p.z+25});return `${i?'L':'M'}${q.x} ${q.y}`;}).join(' '));if(elapsed>=points.at(-1).t)finish();else frameId=requestAnimationFrame(animate);}
  frameId=requestAnimationFrame(animate);
 }
 function changeZoom(factor){if(busy||drag)return;zoom=Math.max(1,Math.min(4,zoom*factor));renderMap();}
 const point=event=>{const rect=svg.getBoundingClientRect();return {x:(event.clientX-rect.left)*800/rect.width,y:(event.clientY-rect.top)*600/rect.height,t:event.timeStamp};};
 on(svg,'pointerdown',event=>{
  if(busy||event.button!==0)return;
  if(event.target.closest('[data-ball]')){if(drag||bag.error==='read'||$('[data-throw]').disabled)return;drag={id:event.pointerId,samples:[point(event)]};home();lock();svg.setPointerCapture?.(event.pointerId);event.preventDefault();}
  else if(!drag){pointers.set(event.pointerId,point(event));svg.setPointerCapture?.(event.pointerId);if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);pinching=true;}}
 });
 on(svg,'pointermove',event=>{
  if(drag?.id===event.pointerId){const p=point(event);drag.samples.push(p);if(drag.samples.length>600)drag.samples.shift();const spin=gestureSpin(drag.samples),ground=view.ground(p,25);if(ground)drawBall(ground,reducedMotion()?0:spin.angle);$('[data-spin]').textContent=`SPIN ${spin.spin.toFixed(1)}`;event.preventDefault();}
  else if(pointers.has(event.pointerId)){pointers.set(event.pointerId,point(event));if(pointers.size===2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)changeZoom(distance/pinchDistance);pinchDistance=distance;}}
 });
 on(svg,'pointerup',event=>{
  if(drag?.id===event.pointerId){drag.samples.push(point(event));const input=gestureThrow(drag.samples);drag=null;home();lock();if(input)launch(input);else status.textContent='위로 조금 더 빠르게 쓸어 던져보세요.';}
  else if(pointers.has(event.pointerId)){if(!pinching){const p=view.ground(point(event)),coordinates=p?[projection.cx+(p.x-400)/(projection.scale*projection.lonScale),projection.cy-(p.y-190)/projection.scale]:null,hit=coordinates?hitRegion(coordinates,activeRegions()):null;if(hit)drill(hit);}pointers.delete(event.pointerId);if(!pointers.size)pinching=false;}
  if(svg.hasPointerCapture?.(event.pointerId))svg.releasePointerCapture(event.pointerId);
 });
 on(svg,'pointercancel',()=>cancel());on(svg,'lostpointercapture',event=>{if(drag?.id===event.pointerId)cancel();});
 on(svg,'wheel',event=>{event.preventDefault();if(busy||drag)return;if(event.deltaY<0&&zoom>=1.5){const p=view.ground(point(event)),hit=p?hitRegion([projection.cx+(p.x-400)/(projection.scale*projection.lonScale),projection.cy-(p.y-190)/projection.scale],activeRegions()):null;if(hit&&hit.level!=='town'){drill(hit);return;}}changeZoom(event.deltaY<0?1.15:1/1.15);},{passive:false});
 on(scope,'change',()=>{selected=null;setProvince(scope.value);});
 on(city,'change',()=>{level.querySelector('[value="town"]').disabled=!city.value;level.value=city.value?'town':'city';zoom=1;renderMap();lock();home();});
 on(level,'change',()=>{if(level.value==='province'){scope.value='';city.value='';city.disabled=true;}zoom=1;renderMap();lock();home();});
 on($('[data-back]'),'click',()=>{if(!busy&&!drag)setProvince('');});
 for(const targetRoot of bagContainer?[root,bagElement]:[root]){
  on(targetRoot,'click',event=>{const id=event.target.closest('[data-details]')?.dataset.details;if(id){const region=regions.find(r=>r.id===id);if(region){if(onDetailsOpen)onDetailsOpen(id);else details.show(region);}}});
  on(targetRoot,'click',event=>{const target=event.target.closest('button');if(!target)return;if(target.dataset.zoom)changeZoom(Number(target.dataset.zoom)>0?1.25:.8);if(target.hasAttribute('data-throw')){const angle=Number($('[data-direction]').value)*Math.PI/180,speed=Number($('[data-power]').value);launch({vx:Math.sin(angle)*speed,vy:-Math.cos(angle)*speed,spin:Number($('[data-spin-input]').value)});}if(busy||drag)return;if(target.hasAttribute('data-remove')){bag.remove(target.dataset.remove);renderBag();}if(target.hasAttribute('data-undo')){bag.undo();renderBag();}if(target.hasAttribute('data-reset-bag')){bag.reset();renderBag();}if(target.hasAttribute('data-retry')){bag.retry();renderBag();}});
 }
 for(const name of ['direction','power','spin']){const input=$(`[data-${name==='spin'?'spin-input':name}]`);on(input,'input',()=>{$(`[data-${name}-value]`).textContent=input.value+(name==='direction'?'°':'');if(name==='spin'&&!busy&&!drag){drawBall({x:400,y:550,z:0},reducedMotion()?0:Number(input.value)*55);$('[data-spin]').textContent=`SPIN ${input.value}`;}});}
 on(window,'resize',()=>cancel());on(window,'pagehide',()=>cancel());on(document,'visibilitychange',()=>{if(document.hidden)cancel();});on(window,'hashchange',()=>cancel());
 renderMap();renderBag();home();
 return {activate:home,closeCandidate:()=>details.close(),showCandidate(id){const region=regions.find(r=>r.id===id);if(!region||!bag.items.some(i=>i.id===id))return false;details.show(region);return true;},destroy(){dead=true;cancel();events.abort();scene.destroy();details.destroy();bagElement.remove();root.replaceChildren();}};
}
