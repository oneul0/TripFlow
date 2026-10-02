import {mountBoard} from './board-ui.js';
import {mountCourses} from './course-ui.js';
import {mountClassification} from './classification-ui.js';
import {areas,types} from './adapters/catalog.js';
import {mountExplorer} from './map-explorer.js';
import {mountRandomTrip} from './random-trip.js';
import {mountNavigation} from './navigation.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=map=>Object.entries(map).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
function field(name,label,type='text',autocomplete='',value=''){
 return `<div class="mb-3"><label class="form-label" for="account-${name}">${label}</label><input class="form-control" id="account-${name}" name="${name}" type="${type}" autocomplete="${autocomplete}" value="${escape(value)}" required ${type==='password'?'minlength="8" maxlength="128"':''}></div>`;
}
export function mountApp(root,{tour,members,board,courseCommunity,courseService,mode,mapMode='sample',mapKey='',tourPreview}) {
 root.innerHTML=`
 <header class="site-header"><a class="brand" href="#"><span class="brand-mark">e<span>✦</span></span>EnjoyTrip<span class="brand-dot">.</span></a><nav aria-label="주 메뉴"><a class="nav-active" href="#explore">여행지 탐색</a><a href="#about">서비스 소개</a></nav><div id="account-nav" class="account-nav"></div></header>
 <main><section class="hero"><div class="hero-copy"><p class="eyebrow">THE WEEKEND IS YOURS</p><h1>이번 주말,<br>어디든 <em>좋아.</em></h1><p class="hero-description">바다로, 골목으로, 낯선 도시로.<br>마음이 먼저 떠나는 여행을 찾아보세요.</p><a class="hero-link" href="#explore">여행지 둘러보기 <span>↗</span></a><div class="hero-edition"><span>LOCAL TRAVEL CLUB</span><span>VOL. 01 — 가을의 시작</span></div></div><div class="hero-landscape" role="img" aria-label="제주 해안을 모티프로 생성한 여행 이미지"><div class="destination-stamp">다음 목적지<br><strong>JEJU</strong><span>33.45° N / 126.53° E</span></div><div class="landscape-label"><span>GO SOMEWHERE NEW.</span><strong>길 끝에서 만나는 바다.</strong><small>AI 생성 여행 이미지</small></div></div></section>
 <section id="explore" class="explore-section"><div class="section-heading"><div><p class="eyebrow">PICK YOUR NEXT STOP</p><h2>취향 따라, 발길 따라.</h2></div><p>가까운 여행부터 시작해요 ↙</p></div>
 <form id="search-form" class="search-panel"><div class="search-field"><label for="area">지역</label><select class="form-select" id="area" name="area"><option value="">전국 어디든</option>${options(areas)}</select></div><div class="search-field"><label for="type">콘텐츠 유형</label><select class="form-select" id="type" name="type"><option value="">모든 여행 경험</option>${options(types)}</select></div><div class="search-field keyword"><label for="query">검색어</label><input class="form-control" id="query" name="query" placeholder="장소나 주소를 입력하세요" maxlength="100"></div><button class="btn search-button" type="submit">여행지 찾기 <span aria-hidden="true">↗</span></button></form>
 <section id="map-explorer" class="map-explorer" aria-label="지도에서 지역 탐색"></section>
 <div class="results-meta"><div><span class="mode-badge">${mode==='sample'?'샘플 데이터 모드':'공공데이터 연동 모드'}</span><span id="search-status" role="status" aria-live="polite"></span></div><button type="button" id="reset-search" class="reset-button">필터 초기화 ↻</button></div><div id="results" class="place-grid" aria-busy="false"></div>
 </section><section id="about" class="about"><span class="brand-mini">✦</span><div><h2>여행은 새로운 시선에서 시작해요.</h2><p>EnjoyTrip과 함께 우리 지역의 작은 발견을 모아보세요.</p><small>${mode==='sample'?'현재 목록은 동작 확인을 위한 직접 작성한 샘플이며, 실제 관광정보가 아닙니다.':'출처: 한국관광공사 국문 관광정보 서비스. 키워드는 조회된 목록에서 검색합니다.'}</small></div></section></main>
 <footer><a class="brand" href="#">EnjoyTrip.</a><span>조금 더 가까이, 조금 더 새롭게.</span><small>© 2026 EnjoyTrip</small></footer>
 <dialog id="account-dialog" aria-labelledby="account-title"><button id="close-account" class="close-dialog" type="button" aria-label="닫기">×</button><div id="account-panel"></div></dialog>`;
 const main=root.querySelector('main'),home=document.createElement('section');home.id='home';home.dataset.appView='';home.dataset.depth='1';main.prepend(home);
 home.append(root.querySelector('.hero'));
 const entries=document.createElement('section');entries.className='home-entries';entries.setAttribute('aria-label','여행 시작 방법');
 entries.innerHTML='<a href="#explore" class="home-entry"><span class="entry-number">01 / DISCOVER</span><h2>가고 싶은 곳이 있나요?</h2><p>지역과 취향으로 여행지를 찾아보세요.</p><strong>직접 찾아보기 ↗</strong></a><a href="#random-trip" class="home-entry featured"><span class="entry-number">02 / PLAY</span><h2>아직 못 정했다면.</h2><p>공을 던져 뜻밖의 여행지를 만나보세요.</p><strong>랜덤 여행 시작 ↗</strong></a><a href="#candidates" class="home-entry"><span class="entry-number">03 / COLLECT</span><h2>마음에 담아둔 곳.</h2><p>모아둔 후보를 비교하고 살펴보세요.</p><strong>여행 후보 확인 ↗</strong></a>';
 home.append(entries,root.querySelector('#about'));
 const explorePage=root.querySelector('#explore');explorePage.dataset.appView='';explorePage.dataset.depth='2';
 const randomSection=document.createElement('section');randomSection.id='random-trip';randomSection.dataset.appView='';randomSection.dataset.depth='2';
 const candidates=document.createElement('section');candidates.id='candidates';candidates.className='candidate-page random-trip';candidates.dataset.appView='';candidates.dataset.depth='2';candidates.innerHTML='<div class="page-heading"><div><p class="eyebrow">YOUR TRAVEL SHORTLIST</p><h2>여행 후보함</h2><p>모아둔 지역을 비교하고, 마음에 드는 곳을 자세히 살펴보세요.</p></div><a href="#random-trip" class="page-action">후보 더 담기 ↗</a></div>';
 const candidateDetail=document.createElement('section');candidateDetail.id='candidate-detail';candidateDetail.className='candidate-detail-page random-trip';candidateDetail.dataset.appView='';candidateDetail.dataset.depth='3';candidateDetail.innerHTML='<a href="#candidates" class="back-link">← 여행 후보함</a>';
 main.append(randomSection,candidates,candidateDetail);
 const randomTrip=mountRandomTrip(randomSection,{tourPreview,mapMode,mapKey,bagContainer:candidates,detailsContainer:candidateDetail,onDetailsOpen:id=>{location.hash=`candidate/${encodeURIComponent(id)}`;},onDetailsClose:()=>{location.hash='candidates';}});
 candidates.querySelector('#random-bag').insertAdjacentHTML('beforeend','<a href="#random-trip" class="empty-bag-action">공을 던져 후보 찾아보기 ↗</a>');
 const primaryNav=root.querySelector('nav');primaryNav.className='primary-nav';primaryNav.innerHTML='<a href="#home">홈</a><a href="#explore">여행지 탐색</a><a href="#random-trip">랜덤 여행</a><a href="#candidates">여행 후보함</a>';
 for(const brand of root.querySelectorAll('.brand'))brand.href='#home';
 const chrome=document.createElement('div');chrome.className='route-chrome';chrome.innerHTML='<nav data-breadcrumb aria-label="현재 위치"></nav><p data-route-message role="status"></p>';main.before(chrome);
 const results=root.querySelector('#results'),status=root.querySelector('#search-status'),searchForm=root.querySelector('#search-form');
 const classification=mountClassification(searchForm,{mode});
 if(mode==='live'){
  searchForm.elements.area.querySelector('option[value=""]').remove();
  searchForm.elements.area.querySelector('option[value="1"]').defaultSelected=true;
  searchForm.elements.area.value='1';
 }
 let request=0,controller,lastPlaces=[],pageInfo=null,activeFilters=null;
 const independentMap=mode==='live'&&typeof tour.findViewport==='function';
 let mapController,mapTimer,mapRequest=0,mapSignature='',resultView=mode==='live'?'map':'list';
 const scheduleMap=(force=false)=>{
  if(!independentMap||resultView!=='map')return;
  clearTimeout(mapTimer);mapController?.abort();const current=++mapRequest;
  mapTimer=setTimeout(async()=>{
   const bounds=explorer.getBounds(),filters={...activeFilters,bounds};
   const signature=JSON.stringify(filters);if(!force&&signature===mapSignature){explorer.setQueryState('ready');return;}
   mapController=new AbortController();explorer.setQueryState('loading');
   try{
    const found=await tour.findViewport({...filters,signal:mapController.signal});if(current!==mapRequest)return;
    mapSignature=signature;
    const coverage=found.zoomRequired?'범위가 넓습니다. 지도를 확대해주세요.':found.partial?'일부 결과만 조회했습니다. 지도를 확대해주세요.':'현재 지도 범위 조회 완료';
    explorer.update(found.places,{area:mapArea,coverage});
   }catch(error){if(current===mapRequest&&error.name!=='AbortError'){mapSignature='';explorer.setQueryState('error');}}
  },350);
 };
 const pager=document.createElement('div');pager.className='result-view-controls';pager.hidden=true;pager.innerHTML='<button type="button" data-page-prev>이전 페이지</button><span role="status" data-page-status></span><button type="button" data-page-next>다음 페이지</button>';results.after(pager);
 const previous=pager.querySelector('[data-page-prev]'),next=pager.querySelector('[data-page-next]');
 previous.addEventListener('click',()=>search(pageInfo.pageNo-1));next.addEventListener('click',()=>search(pageInfo.pageNo+1));
 const viewControls=document.createElement('div');viewControls.className='result-view-controls';viewControls.setAttribute('role','group');viewControls.setAttribute('aria-label','검색 결과 표시 방식');viewControls.innerHTML='<button type="button" data-result-view="list" aria-pressed="true">목록 보기</button><button type="button" data-result-view="map" aria-pressed="false">지도 보기</button>';
 searchForm.after(viewControls);const resultMeta=root.querySelector('.results-meta');viewControls.after(resultMeta);
 function setResultView(kind){resultView=kind;root.querySelector('#map-explorer').hidden=kind!=='map';results.hidden=kind!=='list';pager.hidden=kind!=='list'||pageInfo?.mode!=='live';for(const button of viewControls.children)button.setAttribute('aria-pressed',String(button.dataset.resultView===kind));if(kind==='map'&&document.documentElement.clientHeight)window.dispatchEvent(new Event('resize'));if(kind==='map')scheduleMap();else{clearTimeout(mapTimer);mapController?.abort();mapRequest++;}}
 viewControls.addEventListener('click',event=>{const kind=event.target.closest('[data-result-view]')?.dataset.resultView;if(kind)setResultView(kind);});
 let mapArea='1';
 const mountArea=area=>mountExplorer(root.querySelector('#map-explorer'),{area,mapMode,mapKey,onRegionChange(){
  if(!independentMap)renderPlaces(explorer.visible());
 },onViewportChange:()=>scheduleMap(),onScopeChange(){if(!independentMap)renderPlaces(explorer.visible());else scheduleMap(true);},onPlaceChange(id){setResultView('map');for(const card of results.children)card.classList.toggle('place-selected',card.dataset.contentId===id);}});
 let explorer=mountArea(mapArea);
 setResultView(mode==='live'?'map':'list');
 function renderPlaces(places){
  results.replaceChildren(...places.map(place=>{
   const card=document.createElement('article');card.className='place-card';card.dataset.contentId=place.contentId;
   card.classList.toggle('place-selected',place.contentId===explorer.selectedPlace);
   const scene=['coast','sea','food','stay','culture','palace','festival','shop'].includes(place.scene)?place.scene:'coast';
   card.innerHTML=`<div class="place-visual scene-${scene}"><span class="category">${escape(types[place.contentTypeId]||'여행지')}</span><span class="visual-word">${escape(areas[place.areaCode]||'KOREA')}</span><span class="image-note">이미지 예시 · AI 생성</span></div><div class="place-body"><p class="place-area">${escape(areas[place.areaCode]||'대한민국')}</p><h3>${escape(place.title)}</h3><p>${escape(place.description||place.address||'주소 정보 없음')}</p><span class="place-address">${escape(place.address)}</span></div>`;
   if(explorer.hasPlace(place.contentId)){const button=document.createElement('button');button.type='button';button.className='place-map-button';button.dataset.focusPlace=place.contentId;button.textContent='지도에서 보기 ↗';button.setAttribute('aria-label',`${place.title} 지도에서 보기`);button.addEventListener('click',()=>explorer.choosePlace(place.contentId));card.querySelector('.place-body').append(button);}
   if(mode==='sample'){const add=document.createElement('button');add.type='button';add.dataset.coursePlace=place.contentId;add.textContent='일정에 추가';card.querySelector('.place-body').append(add);}
   if(place.imageUrl){try{const url=new URL(place.imageUrl);if(['https:','http:'].includes(url.protocol)){const img=document.createElement('img');img.src=url.href;img.alt='';img.loading='lazy';img.referrerPolicy='no-referrer';img.addEventListener('load',()=>card.querySelector('.image-note').hidden=true,{once:true});img.addEventListener('error',()=>img.remove(),{once:true});card.querySelector('.place-visual').prepend(img);}}catch{/* Keep generated example for malformed URLs. */}}
   return card;
  }));
  status.textContent=places.length?`${places.length}개의 여행지를 발견했어요`:'검색 결과가 없습니다. 조건을 바꿔보세요.';
  if(pageInfo?.mode==='live')status.textContent+=` · 목록 전체 ${pageInfo.totalCount}개 중 ${pageInfo.pageNo}페이지 · 목록 검색어는 현재 페이지 기준`;
 }
 async function search(pageNo=1){
  const current=++request;controller?.abort();controller=new AbortController();
  if(pageNo===1||!activeFilters)activeFilters={...Object.fromEntries(new FormData(searchForm)),classification:classification.value()};
  const data={...activeFilters,pageNo};
  const area=data.area||'1';if(area!==mapArea){explorer.destroy();mapArea=area;explorer=mountArea(area);}
  if(pageNo===1)scheduleMap(true);
  previous.disabled=next.disabled=true;
  status.textContent='여행지를 찾고 있습니다…';results.setAttribute('aria-busy','true');if(!independentMap)explorer.setQueryState('loading');
  try{
   const found=tour.findPage?await tour.findPage({...data,signal:controller.signal}):{places:await tour.find({...data,signal:controller.signal}),mode:'sample'};
   if(current!==request) return;
   pageInfo=found;lastPlaces=found.places;renderPlaces(independentMap?lastPlaces:explorer.update(lastPlaces,{area:data.area}));
   pager.hidden=found.mode!=='live'||resultView!=='list';previous.disabled=found.pageNo<=1;next.disabled=found.pageNo*20>=found.totalCount;pager.querySelector('[data-page-status]').textContent=`${found.pageNo} / ${Math.max(1,Math.ceil(found.totalCount/20))} 페이지`;
  }catch(error){if(current===request&&error.name!=='AbortError'){results.replaceChildren();pager.hidden=true;if(!independentMap)explorer.setQueryState('error');status.textContent=error.message||'조회하지 못했습니다. 다시 시도해주세요.';}}
  finally{if(current===request) results.setAttribute('aria-busy','false');}
 }
 searchForm.addEventListener('submit',event=>{event.preventDefault();explorer.clearSelection();search();});
 searchForm.elements.area.addEventListener('change',()=>{explorer.clearSelection();search();});
 root.querySelector('#reset-search').addEventListener('click',()=>{searchForm.reset();classification.reset();explorer.clearSelection();search();});
 const dialog=root.querySelector('#account-dialog'),panel=root.querySelector('#account-panel'),nav=root.querySelector('#account-nav');
 let accountChanged=()=>{};
 function renderNav(){
  let user;try{user=members.current();}catch(error){status.textContent=error.message;}
  nav.innerHTML=user?`<button type="button" data-account="profile">내 정보</button><button type="button" data-account="logout">로그아웃</button>`:`<button type="button" data-account="login">로그인</button><button class="join-button" type="button" data-account="register">회원가입</button>`;
 }
 function openAccount(view){renderAccount(view);if(!dialog.open){if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}}
 root.querySelector('#close-account').addEventListener('click',()=>dialog.close());
 nav.addEventListener('click',event=>{const view=event.target.closest('[data-account]')?.dataset.account;if(!view)return;if(view==='logout'){try{members.logout();renderNav();accountChanged();dialog.close();}catch(error){status.textContent=error.message;}}else openAccount(view);});
 function renderAccount(view){
  const titles={login:'다시 만나 반가워요',register:'여행의 시작, EnjoyTrip',reset:'비밀번호 찾기',profile:'내 여행 프로필'};
  let user;try{user=members.current();}catch(error){panel.textContent=error.message;return;}
  if(view==='profile'&&!user){view='login';}
  let inputs='',submit='';
  if(view==='register'){inputs=field('name','이름','text','name')+field('email','이메일','email','email')+field('password','비밀번호','password','new-password')+field('confirm','비밀번호 확인','password','new-password');submit='가입하기';}
  if(view==='login'){inputs=field('email','이메일','email','email')+field('password','비밀번호','password','current-password');submit='로그인하기';}
  if(view==='reset'){inputs=field('email','이메일','email','email')+field('recoveryCode','복구 코드','text','off')+field('password','새 비밀번호','password','new-password');submit='비밀번호 재설정';}
  if(view==='profile'){inputs=`<p>${escape(user.email)}</p>`+field('name','이름','text','name',user.name);submit='정보 저장';}
  panel.innerHTML=`<p class="eyebrow">YOUR LITTLE ESCAPE</p><h2 id="account-title">${titles[view]}</h2><p class="demo-notice">학습용 로컬 데모 계정입니다. 실제 개인정보를 사용하지 마세요.${view==='reset'?' 가입할 때 받은 복구 코드가 필요합니다.':''}</p><form id="account-form">${inputs}<p id="account-message" role="status" aria-live="polite"></p><button class="btn account-submit w-100" type="submit">${submit}</button></form>${view==='login'?'<button class="text-button" type="button" data-view="reset">비밀번호 찾기</button>':''}${view==='profile'?`<hr><form id="delete-form">${field('password','탈퇴 확인 비밀번호','password','current-password')}<button class="btn btn-outline-danger w-100" type="submit">회원 탈퇴</button></form>`:''}`;
  const message=panel.querySelector('#account-message');
  panel.querySelector('[data-view]')?.addEventListener('click',()=>renderAccount('reset'));
  panel.querySelector('#account-form').addEventListener('submit',async event=>{
   event.preventDefault();const form=event.currentTarget;const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;message.textContent='처리 중…';
   const values=Object.fromEntries(new FormData(form));
   try{
    if(view==='register'){
     const account=await members.register(values);form.reset();message.innerHTML=`가입했습니다. 아래 복구 코드를 안전하게 보관하세요.<br><code id="recovery-code">${escape(account.recoveryCode)}</code><br>이 코드는 이 화면에서만 확인할 수 있습니다.`;
     root.dispatchEvent(new CustomEvent('enjoytrip:success',{detail:{target:button}}));
    }
    if(view==='login'){await members.login(values.email,values.password);renderNav();dialog.close();accountChanged();}
    if(view==='profile'){members.update(values.name);message.textContent='정보를 저장했습니다.';renderNav();}
    if(view==='reset'){await members.reset(values.email,values.recoveryCode,values.password);form.reset();message.textContent='비밀번호를 재설정했습니다. 다시 로그인해주세요.';renderNav();}
   }catch(error){message.textContent=error.message;message.className='text-danger';}
   finally{button.disabled=false;}
  });
  panel.querySelector('#delete-form')?.addEventListener('submit',async event=>{
   event.preventDefault();const form=event.currentTarget,button=form.querySelector('button');if(button.disabled)return;button.disabled=true;
   try{await members.remove(new FormData(form).get('password'));renderNav();dialog.close();accountChanged();status.textContent='회원 탈퇴가 완료되었습니다.';}catch(error){message.textContent=error.message;}finally{button.disabled=false;}
  });
 }
 renderNav();search();
 const courses=mountCourses(root,{members,community:courseCommunity});
 let boardUI;
 if(board){const boardRoot=document.createElement('section');boardRoot.id='board';boardRoot.className='board-page';boardRoot.dataset.appView='';boardRoot.dataset.depth='2';boardRoot.hidden=true;main.append(boardRoot);primaryNav.insertAdjacentHTML('beforeend','<a href="#board">여행 후기</a>');
 boardUI=mountBoard(boardRoot,{board,members,courseService,onLogin:()=>openAccount('login'),navigate:hash=>{if(location.hash.slice(1)===hash)boardUI.render(hash);else location.hash=hash;}});}
 accountChanged=()=>{courses.accountChanged();if(root.dataset.currentPage==='board')boardUI?.refresh();};
 const navigation=mountNavigation(root,{showCandidate:id=>randomTrip.showCandidate(id),closeCandidate:()=>randomTrip.closeCandidate(),onPage:(page,hash)=>{if(page==='random-trip')randomTrip.activate();courses.render(page,hash);if(page==='board')boardUI?.render(hash);else boardUI?.leave?.();}});
 return {search,destroy(){navigation.destroy();courses.destroy();boardUI?.destroy();controller?.abort();request++;clearTimeout(mapTimer);mapController?.abort();mapRequest++;explorer.destroy();randomTrip.destroy();}};
}
