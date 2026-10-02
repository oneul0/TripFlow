import {it,expect,vi} from 'vitest';
import {mountApp} from '../src/ui.js';
it('MAP-21 live 첫 진입과 지역 변경은 검색 제출 없이 지도를 조회한다',async()=>{
 document.body.innerHTML='<div id="app"></div>';
 const findPage=vi.fn(async({area,pageNo})=>({places:[],totalCount:0,mode:'live',pageNo}));
 const app=mountApp(document.querySelector('#app'),{tour:{findPage},members:{current:()=>null},mode:'live'});
 await vi.waitFor(()=>expect(findPage).toHaveBeenCalled());
 expect(findPage.mock.lastCall[0]).toMatchObject({area:'1',pageNo:1});
 expect(document.querySelector('#map-explorer').hidden).toBe(false);
 const area=document.querySelector('#area');area.value='6';area.dispatchEvent(new Event('change',{bubbles:true}));
 await vi.waitFor(()=>expect(findPage.mock.lastCall[0]).toMatchObject({area:'6',pageNo:1}));
 expect(document.querySelector('#map-explorer h3').textContent).toContain('부산');
 document.querySelector('#reset-search').click();expect(area.value).toBe('1');app.destroy();
});
