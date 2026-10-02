import {areas,types,createSampleCatalog} from './adapters/catalog.js';
import {toBlock} from './modules/course-blocks.js';
import {esc} from './course-block-ui.js';
export function mountCoursePicker(root,{tour,bag,actor,state,onChange}){
 let controller,revision=0,dead=false;const events=new AbortController();
 const options=values=>Object.entries(values).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('');
 root.innerHTML=`<h3>1. 가고 싶은 곳부터 담아보세요</h3><p>관광지와 음식점을 한곳에서 골라두고, 다음 단계에서 방문 순서를 연결하세요.</p><form data-picker-search class="picker-search"><label>지역<select name="pickerArea">${options(areas)}</select></label><label>유형<select name="pickerType"><option value="">전체</option>${options(types)}</select></label><button type="submit" class="course-primary">장소 찾기</button></form><p data-picker-status role="status"></p><button data-picker-retry hidden>다시 조회</button><div data-picker-results class="picker-grid"></div><div class="picker-pagination"><button data-picker-prev>이전</button><span data-picker-page></span><button data-picker-next>다음</button></div>`;
 const $=s=>root.querySelector(s),form=$('form');form.elements.pickerArea.value=state.area||'1';form.elements.pickerType.value=state.type||'';
 function paint(){
  if(dead)return;const items=bag.list(actor),picked=new Set(items.map(p=>p.id));
  $('[data-picker-status]').textContent=state.loading?'장소를 찾고 있어요…':state.error?'장소를 불러오지 못했습니다. 다시 시도해주세요.':`${state.mode==='live'?'한국관광공사':'샘플'} · ${state.places?.length||0}곳${state.partial?' · 전체 중 현재 페이지':''}${state.places?.length===0?' · 다른 지역이나 유형을 선택해보세요.':''}`;
  $('[data-picker-retry]').hidden=!state.error;
  $('[data-picker-results]').innerHTML=(state.places||[]).map((p,i)=>{const added=picked.has(state.mode==='live'?`tourapi:${p.contentId}`:String(p.contentId));return `<article><span class="place-kind">${esc(types[p.contentTypeId]||'유형 미제공')}</span><h4>${esc(p.title)}</h4><p>${esc(p.address||'주소 정보 없음')}</p><button data-picker-add="${i}" ${added||state.loading?'disabled':''}>${added?'후보에 담김':'후보 담기'}</button></article>`;}).join('');
  $('[data-picker-page]').textContent=`${state.pageNo||1}페이지`;$('[data-picker-prev]').disabled=state.loading||(state.pageNo||1)<=1;$('[data-picker-next]').disabled=state.loading||state.mode!=='live'||(state.pageNo||1)*20>=(state.totalCount||0);form.querySelector('button').disabled=!!state.loading;
 }
 async function search(pageNo=1){
  controller?.abort();controller=new AbortController();const token=++revision;state.area=form.elements.pickerArea.value;state.type=form.elements.pickerType.value;state.pageNo=pageNo;state.loading=true;state.error=false;paint();
  try{const filters={area:state.area,type:state.type,pageNo,signal:controller.signal};const result=tour?.findPage?await tour.findPage(filters):{places:await (tour?.find?tour.find(filters):createSampleCatalog().list(filters)),mode:'sample',pageNo:1};if(dead||token!==revision)return;Object.assign(state,result,{loading:false,error:false});paint();}
  catch(error){if(dead||token!==revision||error.name==='AbortError')return;state.loading=false;state.error=true;state.places=[];paint();}
 }
 form.addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();search();},{signal:events.signal});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-picker-add')){try{const place=state.places[Number(b.dataset.pickerAdd)];bag.add(actor,toBlock(place,state.mode==='live'?'tourapi':'sample'));onChange();}catch{state.error=true;paint();}}if(b.hasAttribute('data-picker-prev'))search(state.pageNo-1);if(b.hasAttribute('data-picker-next'))search(state.pageNo+1);if(b.hasAttribute('data-picker-retry'))search(state.pageNo);},{signal:events.signal});
 paint();if(!state.places&&!state.error)search();
 return {destroy(){dead=true;revision++;controller?.abort();state.loading=false;events.abort();}};
}
