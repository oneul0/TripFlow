// @vitest-environment node
import {it,expect} from 'vitest';
import config from '../vite.config.js';
it('HAR-002 검증 모드는 임의 환경변수와 관광 키를 노출하지 않는다',()=>{
 const settings=config({mode:'harness'});
 expect(settings.envPrefix).toEqual([]);
 expect(settings.define['import.meta.env.VITE_DATA_MODE']).toBe('"sample"');
 expect(settings.define['import.meta.env.VITE_TOUR_API_KEY']).toBe('""');
 expect(settings.define['import.meta.env.VITE_TOUR_API_BASE_URL']).toBe('""');
 expect(settings.define['import.meta.env.VITE_KAKAO_MAP_APP_KEY']).toBe('""');
 expect(settings.define['import.meta.env.VITE_MAP_MODE']).toBe('"sample"');
 expect(Object.keys(settings.define)).toHaveLength(5);
});
it('지도 전용 모드는 TourAPI 키를 공개하지 않는다',()=>{
 const settings=config({mode:'map'});
 expect(settings.define['import.meta.env.VITE_DATA_MODE']).toBe('"sample"');
 expect(settings.define['import.meta.env.VITE_TOUR_API_KEY']).toBe('""');
 expect(settings.define['import.meta.env.VITE_MAP_MODE']).toBe('"kakao"');
});
