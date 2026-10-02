// @vitest-environment node
import {it,expect,vi} from 'vitest';
import {createWeatherHandler} from '../server/weather.js';
import {resolveStation} from '../src/modules/course-weather.js';
const now=()=>new Date('2026-10-02T03:00Z'),station=resolveStation({title:'국립중앙박물관',area:'1'}),path='/api/weather/forecast?station='+station.id+'&date=2026-10-02';
const invoke=async(handler,url=path,extra={})=>{let body;const res={statusCode:200,setHeader(){},on(){},end(v){body=JSON.parse(v);}};await handler({url,method:'GET',headers:{host:'localhost'},...extra},res,()=>{});return {status:res.statusCode,body};};
it('WTH03 키 누락·임의 요청·외부 origin은 차단하고 키는 응답에 포함하지 않는다',async()=>{
 const fetcher=vi.fn(),h=createWeatherHandler({now,fetcher});expect((await invoke(h)).status).toBe(503);expect((await invoke(h,path+'&key=x')).status).toBe(400);expect((await invoke(h,path,{method:'POST'})).status).toBe(405);expect((await invoke(h,path,{headers:{host:'localhost',origin:'https://other.test'}})).status).toBe(403);expect(fetcher).not.toHaveBeenCalled();
});
it('WTH03 고정 HTTPS 공급자·정규화와 날짜 범위, 오류 원문 비노출',async()=>{
 const row={courseId:station.course,spotAreaId:station.id,spotName:station.name,tm:'2026-10-02 12:00',sky:1,th3:23,pop:10};const fetcher=vi.fn(async()=>({ok:true,json:async()=>({response:{header:{resultCode:'00'},body:{totalCount:1,items:{item:[row]}}}})}));const h=createWeatherHandler({key:'synthetic-secret',fetcher,now});const result=await invoke(h);expect(result.body.data.slots).toHaveLength(1);expect(JSON.stringify(result)).not.toContain('synthetic-secret');expect(fetcher.mock.calls[0][0].origin).toBe('https://apis.data.go.kr');expect((await invoke(h,path.replace('2026-10-02','2026-10-12'))).body.data.status).toBe('unavailable');expect(fetcher).toHaveBeenCalledTimes(1);
 const error=await invoke(createWeatherHandler({key:'synthetic',now,fetcher:async()=>{throw Error('sensitive upstream');}}));expect(error.status).toBe(502);expect(JSON.stringify(error)).not.toContain('sensitive');
});
it('WTH03 기본 URL 오염 및 불완전 페이지는 정상 예보로 표시하지 않는다',async()=>{
 const fetcher=vi.fn();expect((await invoke(createWeatherHandler({key:'synthetic',now,fetcher,baseUrl:'https://other.test'}))).status).toBe(502);expect(fetcher).not.toHaveBeenCalled();
 const partial=createWeatherHandler({key:'synthetic',now,fetcher:async()=>({ok:true,json:async()=>({response:{header:{resultCode:'00'},body:{totalCount:100,items:''}}})})});expect((await invoke(partial)).status).toBe(502);
});
