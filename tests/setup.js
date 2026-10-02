import {beforeEach,vi} from 'vitest';
beforeEach(()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>{throw Error('하네스: 외부 요청 차단. 테스트 응답을 주입하세요.');}));
});
