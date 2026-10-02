import {it,expect,vi} from 'vitest';
import {mountExplorer} from '../src/map-explorer.js';
import {createTourApiCatalog} from '../src/adapters/catalog.js';
import {mountApp} from '../src/ui.js';
it('TOUR-47 다음 페이지 조회와 지역 변경은 올바른 페이지·지도를 사용한다',async()=>{
 document.body.innerHTML='<div id="app"></div>';
 const findPage=vi.fn(async({pageNo,area})=>({places:[{contentId:String(pageNo),title:`합성 ${area} ${pageNo}`,areaCode:area}],totalCount:2228,pageNo,mode:'live',partial:true}));
 mountApp(document.querySelector('#app'),{tour:{findPage},members:{current:()=>null},mode:'live'});
 const form=document.querySelector('#search-form');form.elements.area.value='6';form.dispatchEvent(new Event('submit',{cancelable:true}));
 await vi.waitFor(()=>expect(document.querySelector('#search-status').textContent).toContain('2228'));
 document.querySelector('[data-page-next]').click();
 await vi.waitFor(()=>expect(document.querySelector('#search-status').textContent).toContain('2페이지'));
 expect(findPage.mock.lastCall[0]).toMatchObject({area:'6',pageNo:2});
 form.elements.area.value='39';form.dispatchEvent(new Event('submit',{cancelable:true}));
 await vi.waitFor(()=>expect(document.querySelector('#map-explorer h3').textContent).toContain('제주'));
 expect(findPage.mock.lastCall[0]).toMatchObject({area:'39',pageNo:1});
});
it('MAP-20 부산과 제주 지도는 서울 구역을 표시하지 않는다',()=>{
 for(const [area,name] of [['6','부산'],['39','제주']]){
  const root=document.createElement('div'),map=mountExplorer(root,{area});
  expect(root.querySelector('h3').textContent).toContain(name);
  expect(root.querySelector('#district-list').textContent).not.toContain('강남구');
  expect(root.querySelector('#all-regions').textContent).toContain(name);map.destroy();
 }
});
it('TOUR-47 1000건 이상도 한 페이지만 조회하고 전체 개수를 보존한다',async()=>{
 const fetcher=vi.fn(async()=>({ok:true,json:async()=>({response:{header:{resultCode:'0000'},body:{totalCount:2228,items:{item:[{contentid:'x',title:'합성',lDongRegnCd:'26'}]}}}})}));
 const catalog=createTourApiCatalog({key:'synthetic',fetcher});
 expect(catalog.page).toBeTypeOf('function');
 const result=await catalog.page({area:'6',pageNo:2});expect(result).toMatchObject({totalCount:2228,pageNo:2,partial:true});
 expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('pageNo')).toBe('2');expect(fetcher).toHaveBeenCalledTimes(1);
});
