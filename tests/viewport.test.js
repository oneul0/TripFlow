import {it,expect,vi} from 'vitest';
import {createViewportCatalog} from '../src/adapters/viewport-catalog.js';
import {mountApp} from '../src/ui.js';
it('MAP-22 목록 한 페이지가 지도35개를 덮어쓰지 않는다',async()=>{
 document.body.innerHTML='<div id="app"></div>';
 const places=Array.from({length:35},(_,i)=>({contentId:String(i),title:'합성',latitude:37.579,longitude:126.977,areaCode:'1'}));
 const findViewport=vi.fn(async()=>({places,partial:false}));
 const app=mountApp(document.querySelector('#app'),{mode:'live',members:{current:()=>null},tour:{findViewport,findPage:async()=>({places:places.slice(0,1),totalCount:100,pageNo:1,mode:'live'})}});
 await vi.waitFor(()=>expect(document.querySelector('#region-summary').textContent).toContain('현재 조회 35개'),{timeout:2000});
 expect(document.querySelectorAll('#results article')).toHaveLength(1);
 expect(document.querySelectorAll('#map-surface .map-point')).toHaveLength(35);
 await app.search(2);expect(document.querySelectorAll('#map-surface .map-point')).toHaveLength(35);app.destroy();
});
it('MAP-22 위치 기반 결과는20건으로 자르지 않고 범위 밖·중복을 제거한다',async()=>{
 const items=Array.from({length:35},(_,i)=>({contentid:String(i+1),title:'합성',mapx:'127',mapy:'37.5',lDongRegnCd:'11'}));
 items.push(items[0],{contentid:'outside',title:'범위 밖',mapx:'129',mapy:'35'});
 const fetcher=vi.fn(async()=>({ok:true,json:async()=>({response:{header:{resultCode:'0000'},body:{totalCount:items.length,items:{item:items}}}})}));
 const result=await createViewportCatalog({key:'synthetic',fetcher})({area:'1',bounds:{west:126.99,east:127.01,south:37.49,north:37.51}});
 expect(result.places).toHaveLength(35);expect(result.partial).toBe(false);
 expect(new URL(fetcher.mock.calls[0][0]).pathname).toContain('locationBasedList2');
});
it('MAP-22 너무 넓거나 잘못된 범위는 외부 조회하지 않는다',async()=>{
 const fetcher=vi.fn(),viewport=createViewportCatalog({key:'synthetic',fetcher});
 await expect(viewport({bounds:{west:NaN,east:128,south:35,north:36}})).rejects.toThrow();
 expect(await viewport({bounds:{west:124,east:132,south:33,north:39}})).toMatchObject({zoomRequired:true,partial:true});expect(fetcher).not.toHaveBeenCalled();
});
it('MAP-22 지역 변경 뒤 늦게 끝난 지도 조회는 무시한다',async()=>{
 document.body.innerHTML='<div id="app"></div>';let finishOld;
 const findViewport=vi.fn().mockImplementationOnce(()=>new Promise(r=>finishOld=r)).mockResolvedValue({places:[],partial:false});
 const app=mountApp(document.querySelector('#app'),{mode:'live',members:{current:()=>null},tour:{findViewport,findPage:async()=>({places:[],totalCount:0,pageNo:1,mode:'live'})}});
 await vi.waitFor(()=>expect(findViewport).toHaveBeenCalledTimes(1),{timeout:2000});
 const area=document.querySelector('#area');area.value='6';area.dispatchEvent(new Event('change'));
 await vi.waitFor(()=>expect(findViewport).toHaveBeenCalledTimes(2),{timeout:2000});
 finishOld({places:[{contentId:'old',title:'이전',latitude:37.579,longitude:126.977}],partial:false});
 await Promise.resolve();await Promise.resolve();expect(document.querySelector('#region-summary').textContent).toContain('현재 조회 0개');expect(document.querySelector('#map-explorer h3').textContent).toContain('부산');app.destroy();
});
