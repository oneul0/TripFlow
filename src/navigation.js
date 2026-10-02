const pages={home:{label:'홈',depth:1},explore:{label:'여행지 탐색',depth:2},'random-trip':{label:'랜덤 여행',depth:2},candidates:{label:'여행 후보함',depth:2},'candidate-detail':{label:'지역 관광정보',depth:3}};
export function mountNavigation(root,{showCandidate,closeCandidate,onPage}={}){
 const views=[...root.querySelectorAll('[data-app-view]')],crumb=root.querySelector('[data-breadcrumb]'),message=root.querySelector('[data-route-message]');let previous;
 function render(initial=false){
  const hash=location.hash.slice(1)||'home';let page=hash.startsWith('candidate/')?'candidate-detail':hash,id='';message.textContent='';
  if(!pages[page]){page='home';history.replaceState(null,'','#home');}
  if(page==='candidate-detail'){try{id=decodeURIComponent(hash.slice('candidate/'.length));}catch{id='';}}
  if(previous==='candidate-detail')closeCandidate?.();
  for(const view of views)view.hidden=view.id!==page;
  if(page==='candidate-detail'&&!showCandidate?.(id)){page='candidates';history.replaceState(null,'','#candidates');message.textContent='저장된 여행 후보를 찾을 수 없습니다. 후보함에서 다시 선택해주세요.';for(const view of views)view.hidden=view.id!==page;}
  previous=page;root.dataset.currentPage=page;
  for(const link of root.querySelectorAll('.primary-nav a')){const active=link.hash===`#${page==='candidate-detail'?'candidates':page}`;link.classList.toggle('nav-active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
  crumb.replaceChildren();crumb.hidden=page==='home';
  const chain=page==='candidate-detail'?['home','candidates','candidate-detail']:['home',page];
  chain.forEach((key,index)=>{if(index){const separator=document.createElement('span');separator.textContent=' / ';separator.setAttribute('aria-hidden','true');crumb.append(separator);}const el=document.createElement(index===chain.length-1?'span':'a');el.textContent=pages[key].label;if(el.tagName==='A')el.href=`#${key}`;else el.setAttribute('aria-current','page');crumb.append(el);});
  document.title=`${pages[page].label} · EnjoyTrip`;onPage?.(page);
  if(!initial){const heading=root.querySelector(`#${page} h1,#${page} h2,#${page} h3`);heading?.setAttribute('tabindex','-1');heading?.focus({preventScroll:true});if(document.documentElement.clientHeight)window.scrollTo({top:0,behavior:'instant'});}
 }
 const change=()=>render();window.addEventListener('hashchange',change);render(true);
 return {destroy(){window.removeEventListener('hashchange',change);}};
}
