import {it,expect,vi} from 'vitest';
import {mountApp} from '../src/ui.js';
const members={current:()=>null};
it('늦게 도착한 이전 검색은 최신 결과를 덮어쓰지 않는다',async()=>{
 document.body.innerHTML='<div id="app"></div>';let resolveFirst,resolveSecond;
 const find=vi.fn().mockImplementationOnce(()=>new Promise(r=>resolveFirst=r)).mockImplementationOnce(()=>new Promise(r=>resolveSecond=r));
 mountApp(document.querySelector('#app'),{tour:{find},members,mode:'sample'});
 const form=document.querySelector('#search-form');form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
 resolveSecond([{contentId:'2',title:'최신 결과',address:'서울',contentTypeId:'12'}]);await vi.waitFor(()=>expect(document.querySelector('#results').textContent).toContain('최신 결과'));
 resolveFirst([{contentId:'1',title:'이전 결과',address:'제주',contentTypeId:'12'}]);await Promise.resolve();await Promise.resolve();
 expect(document.querySelector('#results').textContent).not.toContain('이전 결과');
});
it('빈 결과·실패·외부 문자열을 안전하게 표시한다',async()=>{
 document.body.innerHTML='<div id="app"></div>';const find=vi.fn().mockResolvedValueOnce([]).mockRejectedValueOnce(Error('조회 실패')).mockResolvedValueOnce([{title:'<script>alert(1)</script>',address:'주소',contentTypeId:'12',contentId:'1'}]);
 mountApp(document.querySelector('#app'),{tour:{find},members,mode:'sample'});
 await vi.waitFor(()=>expect(document.querySelector('#search-status').textContent).toContain('없습니다'));
 const form=document.querySelector('#search-form');form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await vi.waitFor(()=>expect(document.querySelector('#search-status').textContent).toContain('조회 실패'));
 form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await vi.waitFor(()=>expect(document.querySelector('#results').textContent).toContain('<script>'));expect(document.querySelector('#results script')).toBeNull();
});
