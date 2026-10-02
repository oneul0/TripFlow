import {it,expect,vi} from 'vitest';
import {createSampleCatalog,createTourApiCatalog} from '../src/adapters/catalog.js';
it('모든 필수 콘텐츠 유형의 샘플을 조회한다',async()=>{
 const catalog=createSampleCatalog();for(const type of ['12','14','15','25','28','32','38','39']) expect((await catalog.list({type})).length).toBeGreaterThan(0);
 expect((await catalog.list({area:'39',type:'39'})).every(p=>p.areaCode==='39'&&p.contentTypeId==='39')).toBe(true);
});
it('TourAPI 응답을 정규화하고 다음 페이지도 조회한다',async()=>{
 const fetcher=vi.fn(async()=>({ok:true,json:async()=>({response:{header:{resultCode:'0000'},body:{totalCount:2,items:{item:[{contentid:String(fetcher.mock.calls.length),title:'관광지',addr1:'주소',mapx:'126',mapy:'33',contenttypeid:'12',areacode:'39',sigungucode:2}]}}}})}));
 const c=createTourApiCatalog({key:'demo',fetcher,pageSize:1});const result=await c.list({area:'39',type:'12'});
 expect(result).toHaveLength(2);expect(result[0]).toMatchObject({contentId:'1',latitude:33,longitude:126,sigunguCode:'2'});
 expect(new URL(fetcher.mock.calls[1][0]).searchParams.get('pageNo')).toBe('2');
});
it('외부 네트워크 오류에 포함된 키를 노출하지 않는다',async()=>{
 const c=createTourApiCatalog({key:'synthetic-only',fetcher:async()=>{throw Error('https://example.com?key=synthetic-only');}});
 await expect(c.list({})).rejects.toThrow('관광정보 조회에 실패했습니다. 다시 시도해주세요.');
});
it('빈 응답과 HTTP/API 오류를 구분한다',async()=>{
 const empty=createTourApiCatalog({key:'x',fetcher:async()=>({ok:true,json:async()=>({response:{header:{resultCode:'0000'},body:{items:'',totalCount:0}}})})});expect(await empty.list({})).toEqual([]);
 await expect(createTourApiCatalog({key:'x',fetcher:async()=>({ok:false})}).list({})).rejects.toThrow(/조회/);
 await expect(createTourApiCatalog({key:'x',fetcher:async()=>({ok:true,json:async()=>({response:{header:{resultCode:'30'}}})})}).list({})).rejects.toThrow(/API/);
});
