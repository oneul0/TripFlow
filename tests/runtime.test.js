import {describe,it,expect} from 'vitest';
import {resolveRuntime} from '../src/runtime.js';
describe('HAR-001 실연동 경계',()=>{
 it('키만 존재하면 샘플을 유지한다',()=>expect(resolveRuntime({VITE_TOUR_API_KEY:'test-only'})).toEqual({mode:'sample',key:''}));
 it('명시적인 live도 클라이언트에 키를 반환하지 않는다',()=>expect(resolveRuntime({VITE_DATA_MODE:'live',VITE_TOUR_API_KEY:'test-only'})).toEqual({mode:'live',key:''}));
 it('live의 키 검증은 서버에서 수행한다',()=>expect(resolveRuntime({VITE_DATA_MODE:'live'})).toEqual({mode:'live',key:''}));
 it('기본 외부 요청은 차단한다',async()=>await expect(fetch('https://example.com')).rejects.toThrow(/차단/));
});
