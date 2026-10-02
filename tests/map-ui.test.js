import {it,expect,vi} from 'vitest';
import {mountApp} from '../src/ui.js';
const places=[{contentId:'a',title:'종로 샘플',address:'종로구',areaCode:'1',contentTypeId:'12',longitude:126.977,latitude:37.579},{contentId:'b',title:'용산 샘플',address:'용산구',areaCode:'1',contentTypeId:'14',longitude:126.98,latitude:37.524},{contentId:'c',title:'좌표 없음',areaCode:'1'}];
it('구 선택·목록과 마커 선택·전체 복귀가 연결된다',async()=>{
 document.body.innerHTML='<div id="app"></div>';
 mountApp(document.querySelector('#app'),{tour:{find:async()=>places},members:{current:()=>null},mode:'sample'});
 await vi.waitFor(()=>expect(document.querySelector('#results').textContent).toContain('종로 샘플'));
 const jongno=[...document.querySelectorAll('[data-select-region]')].find(b=>b.textContent.includes('종로구'));expect(jongno).toBeTruthy();jongno.click();
 await vi.waitFor(()=>expect(document.querySelector('#results').textContent).not.toContain('용산 샘플'));
 expect(jongno.getAttribute('aria-pressed')).toBe('true');
 document.querySelector('[data-focus-place="a"]').click();expect(document.querySelector('#map-detail').textContent).toContain('종로 샘플');
 document.querySelector('#all-regions').click();await vi.waitFor(()=>expect(document.querySelector('#results').textContent).toContain('좌표 없음'));
});
it('조회 실패는 지역 개수 0으로 단정하지 않고 미확인으로 안내한다',async()=>{
 document.body.innerHTML='<div id="app"></div>';
 mountApp(document.querySelector('#app'),{tour:{find:async()=>{throw Error('조회 실패');}},members:{current:()=>null},mode:'sample'});
 await vi.waitFor(()=>expect(document.querySelector('#search-status').textContent).toContain('조회 실패'));
 expect(document.querySelector('#region-summary').textContent).toContain('미확인');
 expect(document.querySelector('[data-select-region]').textContent).toContain('미확인');
});
