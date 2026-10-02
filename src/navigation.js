const pages={board:{label:'커뮤니티',depth:2},courses:{label:'코스 둘러보기',depth:2},'my-trips':{label:'내 여행',depth:2},'course-editor':{label:'계획 편집',depth:3},'course-detail':{label:'코스 상세',depth:3},home:{label:'홈',depth:1},explore:{label:'여행지 탐색',depth:2},'random-trip':{label:'랜덤 여행',depth:2},candidates:{label:'여행 후보함',depth:2},'candidate-detail':{label:'지역 관광정보',depth:3}};
export function mountNavigation(root,{showCandidate,closeCandidate,onPage}={}){
 const views=[...root.querySelectorAll('[data-app-view]')],crumb=root.querySelector('[data-breadcrumb]'),message=root.querySelector('[data-route-message]');let previous;
 function render(initial=false){
  const hash=location.hash.slice(1)||'home';let page=hash.startsWith('board/')?'board':hash.startsWith('candidate/')?'candidate-detail':hash.startsWith('course/')?'course-detail':hash.startsWith('plan/')?'course-editor':hash,id='';message.textContent='';
  if(!pages[page]){page='home';history.replaceState(null,'','#home');}
  if(page==='candidate-detail'){try{id=decodeURIComponent(hash.slice('candidate/'.length));}catch{id='';}}
  if(previous==='candidate-detail')closeCandidate?.();
  for(const view of views)view.hidden=view.id!==page;
  if(page==='candidate-detail'&&!showCandidate?.(id)){page='candidates';history.replaceState(null,'','#candidates');message.textContent='저장된 여행 후보를 찾을 수 없습니다. 후보함에서 다시 선택해주세요.';for(const view of views)view.hidden=view.id!==page;}
  previous=page;root.dataset.currentPage=page;
  for(const link of root.querySelectorAll('.primary-nav a')){const active=link.hash===`#${page==='candidate-detail'?'candidates':page==='course-detail'?'courses':page==='course-editor'?'my-trips':page}`;link.classList.toggle('nav-active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
  crumb.replaceChildren();crumb.hidden=page==='home';
  const chain=page==='candidate-detail'?['home','candidates','candidate-detail']:page==='course-detail'?['home','courses',page]:page==='course-editor'?['home','my-trips',page]:['home',page];
  chain.forEach((key,index)=>{if(index){const separator=document.createElement('span');separator.textContent=' / ';separator.setAttribute('aria-hidden','true');crumb.append(separator);}const el=document.createElement(index===chain.length-1?'span':'a');el.textContent=pages[key].label;if(el.tagName==='A')el.href=`#${key}`;else el.setAttribute('aria-current','page');crumb.append(el);});
  if(page==='board'){const nested=hash.startsWith('board/');root.querySelector('#board').dataset.depth=nested?'3':'2';if(nested){const label=document.createElement('span');label.textContent=hash.startsWith('board/write')?' / 글쓰기':hash.startsWith('board/edit/')?' / 후기 수정':' / 후기 상세';crumb.append(label);}}
  document.title=`${pages[page].label} · TripFlow`;onPage?.(page,hash);
  if(!initial){const heading=(page==='board'?root.querySelector('#board-content h2'):null)||root.querySelector(`#${page} h1,#${page} h2,#${page} h3`);heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});if(document.documentElement.clientHeight)window.scrollTo({top:0,behavior:'instant'});}
 }
 const change=()=>render();window.addEventListener('hashchange',change);render(true);
 return {destroy(){window.removeEventListener('hashchange',change);}};
}
