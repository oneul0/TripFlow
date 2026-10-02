import {it,expect,afterEach} from 'vitest';
import {mountApp} from '../src/ui.js';
let app;afterEach(()=>{app?.destroy();document.body.replaceChildren();localStorage.clear();history.replaceState(null,'','#home');});
it('DS02 내 여행에서 지역 후보를 같은 단계로 탐색',()=>{history.replaceState(null,'','#my-trips');document.body.innerHTML='<div id="app"></div>';app=mountApp(document.querySelector('#app'),{tour:{find:async()=>[]},members:{current:()=>null},mode:'sample'});const tab=document.querySelector('[data-trip-tab="regions"]');expect(tab).not.toBeNull();tab.click();expect(document.querySelector('#my-trips [data-candidates]')).not.toBeNull();expect(tab.getAttribute('aria-pressed')).toBe('true');});
