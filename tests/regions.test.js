import {it,expect} from 'vitest';
import {pointInGeometry,createRegionExplorer,densityIntensity} from '../src/modules/regions.js';
const region={id:'r',name:'테스트구',geometry:{type:'Polygon',coordinates:[[[126,37],[127,37],[127,38],[126,38],[126,37]],[[126.2,37.2],[126.4,37.2],[126.4,37.4],[126.2,37.4],[126.2,37.2]]]}};
it('경계·구멍·다중 다각형을 판정한다',()=>{
 expect(pointInGeometry([126.5,37.5],region.geometry)).toBe(true);
 expect(pointInGeometry([126.3,37.3],region.geometry)).toBe(false);
 expect(pointInGeometry([126,37.5],region.geometry)).toBe(true);
 expect(pointInGeometry([130,37],{type:'MultiPolygon',coordinates:[region.geometry.coordinates]})).toBe(false);
});
it('중복·잘못된 좌표를 제외하고 목록은 유지한다',()=>{
 const places=[{contentId:'1',longitude:126.5,latitude:37.5},{contentId:'1',longitude:126.5,latitude:37.5},{contentId:'2',longitude:NaN,latitude:37},{contentId:'3'}];
 const result=createRegionExplorer([region]).analyze(places);
 expect(result.places).toHaveLength(3);expect(result.regions[0].count).toBe(1);expect(result.unmapped).toBe(2);
 expect(result.select('r').map(p=>p.contentId)).toEqual(['1']);
});
it('밀도 강도는 단조 증가하고 0·동일 개수에서 유효하다',()=>{
 expect(densityIntensity(0,0)).toBe(0);expect(densityIntensity(10,10)).toBe(1);
 expect(densityIntensity(2,20)).toBeGreaterThan(densityIntensity(1,20));
});
