import {it,expect,vi} from 'vitest';
import {createTourApiCatalog} from '../src/adapters/catalog.js';
const response=row=>({ok:true,json:async()=>({response:{header:{resultCode:'0000'},body:{totalCount:1,items:{item:row}}}})});
it('TOUR44 법정동 요청과 응답의 코드 체계를 분리한다',async()=>{const fetcher=vi.fn(async()=>response({contentid:'1',title:'합성',contenttypeid:'12',lDongRegnCd:'26',lDongSignguCd:'380',lclsSystm1:'NA',lclsSystm2:'NA04',lclsSystm3:'NA040500',mapx:'bad',mapy:'99'}));const [p]=await createTourApiCatalog({key:'synthetic',fetcher}).list({area:'6'});const u=new URL(fetcher.mock.calls[0][0]);expect(u.searchParams.get('lDongRegnCd')).toBe('26');expect(u.searchParams.has('areaCode')).toBe(false);expect(p).toMatchObject({areaCode:'6',legalRegionCode:'26',legalDistrictCode:'380',classification:{large:'NA',middle:'NA04',small:'NA040500'}});expect(p.latitude).toBeUndefined();expect(p.sigunguCode).toBe('');});
it('TOUR44 하위 분류 단독 요청은 차단한다',async()=>{const fetcher=vi.fn();await expect(createTourApiCatalog({key:'synthetic',fetcher}).list({classification:{middle:'AC01'}})).rejects.toThrow();expect(fetcher).not.toHaveBeenCalled();});

it('TOUR44 전국 지역과 캠핑 분류를 변환하고 모순된 유형을 거절한다',async()=>{
 const {tourFilters,legalRegions}=await import('../src/adapters/tour-codes.js');
 expect(Object.keys(legalRegions)).toHaveLength(17);
 expect(tourFilters({area:'1'})).toEqual({lDongRegnCd:'11'});
 expect(tourFilters({area:'32'})).toEqual({lDongRegnCd:'51'});
 expect(tourFilters({area:'37'})).toEqual({lDongRegnCd:'52'});
 expect(tourFilters({type:'28',classification:{large:'AC',middle:'AC05',small:'AC050100'}})).toEqual({contentTypeId:'28',lclsSystm1:'AC',lclsSystm2:'AC05',lclsSystm3:'AC050100'});
 expect(()=>tourFilters({type:'32',classification:{large:'AC',middle:'AC05',small:'AC050100'}})).toThrow();
 expect(()=>tourFilters({classification:{large:'AC',middle:'NA04'}})).toThrow();
});
