// @vitest-environment node
import {it,expect,vi} from 'vitest';
import {createTourHandler} from '../server/tour.js';
const invoke=async(handler,url,extra={})=>{let body;const res={statusCode:200,setHeader(){},on(){},end(s){body=JSON.parse(s);}};await handler({url,method:'GET',headers:{host:'localhost:5175'},...extra},res,()=>{});return {status:res.statusCode,body};};
it('TOUR-46 외부 origin·메서드·무효 분류·무지역 요청은 거절한다',async()=>{
 const fetcher=vi.fn(),handler=createTourHandler({key:'synthetic',fetcher});
 for(const [url,extra,status] of [['/api/tour/list?area=1',{method:'POST'},405],['/api/tour/list?area=1',{headers:{host:'localhost:5175',origin:'https://other.test'}},403],['/api/tour/list',{},400],['/api/tour/list?area=1&middle=AC01',{},400]])expect((await invoke(handler,url,extra)).status).toBe(status);
 expect(fetcher).not.toHaveBeenCalled();
});
it('TOUR-46 키 누락과 임의 파라미터는 외부 요청 전에 거절한다',async()=>{
 const fetcher=vi.fn();expect((await invoke(createTourHandler({fetcher}),'/api/tour/list?area=1')).status).toBe(503);
 expect((await invoke(createTourHandler({key:'synthetic',fetcher}),'/api/tour/list?area=1&serviceKey=bad')).status).toBe(400);
 expect(fetcher).not.toHaveBeenCalled();
});
it('TOUR-46 서버가 키를 주입하고 외부 오류 원문은 숨긴다',async()=>{
 const fetcher=vi.fn(async()=>({ok:true,json:async()=>({response:{header:{resultCode:'0000'},body:{totalCount:0,items:''}}})}));
 const handler=createTourHandler({key:'synthetic',fetcher});expect((await invoke(handler,'/api/tour/list?area=1')).body).toEqual({data:[]});
 expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('serviceKey')).toBe('synthetic');
 const failing=createTourHandler({key:'synthetic',fetcher:async()=>{throw Error('private-key');}});
 const result=await invoke(failing,'/api/tour/list?area=1');expect(result.status).toBe(502);expect(JSON.stringify(result)).not.toContain('private-key');
});
