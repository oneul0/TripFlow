import { describe,it,expect,vi } from 'vitest';
import { createTourService } from '../src/modules/tour.js';
import { localSearch, createLogger, unavailableAssistant } from '../src/adapters/extensions.js';
import { createStore } from '../src/adapters/storage.js';
import { createMembers } from '../src/modules/members.js';
import { webcrypto } from 'node:crypto';

const places=[{contentId:'1',title:'제주 바다',address:'제주',areaCode:'39',contentTypeId:'12'}, {contentId:'2',title:'서울 식당',address:'서울',areaCode:'1',contentTypeId:'39'}];
describe('F101 F102 F103 검색',()=>{
 it('지역·유형과 키워드를 적용한다',async()=>{
  const catalog={list:vi.fn(async({area,type})=>places.filter(p=>(!area||p.areaCode===area)&&(!type||p.contentTypeId===type)))};
  const service=createTourService({catalog,search:localSearch,logger:createLogger()});
  expect(await service.find({area:'39',type:'12',query:'바다'})).toEqual([places[0]]);
  expect(await service.find({query:'없는 장소'})).toEqual([]);
  expect(await service.find({})).toHaveLength(2);
 });
 it('실패 응답을 삼키지 않는다',async()=>{
  const service=createTourService({catalog:{list:async()=>{throw Error('network');}},search:localSearch,logger:createLogger()});
  await expect(service.find({})).rejects.toThrow('network');
 });
 it('로그 실패가 검색을 방해하지 않고 비밀 필드를 제외한다',async()=>{
  const sink=vi.fn(()=>{throw Error('logging');}); const logger=createLogger(sink);
  expect(()=>logger.record('search.completed',{count:2,password:'secret',query:'private'})).not.toThrow();
  expect(sink.mock.calls[0][1]).toEqual({count:2});
 });
 it('AI 미연결은 명시적 상태다',async()=>expect(await unavailableAssistant.recommend({places:[]})).toEqual({status:'unavailable',items:[]}));
});
describe('저장소 계약',()=>{
 it('손상 또는 버전 불일치 데이터를 덮어쓰지 않는다',()=>{
  localStorage.setItem('broken','{');const store=createStore(localStorage,'broken',[]);
  expect(()=>store.read()).toThrow(/저장/);expect(localStorage.getItem('broken')).toBe('{');
  localStorage.setItem('broken',JSON.stringify({version:9,data:[]}));expect(()=>store.read()).toThrow(/버전/);
 });
 it('쓰기 실패는 명시적으로 실패한다',()=>expect(()=>createStore({getItem:()=>null,setItem:()=>{throw Error();}},'x',[]).write([])).toThrow(/저장/));
});
describe('F107 F108 회원',()=>{
 const setup=()=>{localStorage.clear();sessionStorage.clear();return createMembers({accounts:createStore(localStorage,'accounts',[]),session:createStore(sessionStorage,'session',null),crypto:webcrypto});};
 it('가입·중복·로그인·수정·탈퇴·로그아웃을 검증한다',async()=>{
  const members=setup();
  await expect(members.register({email:'bad',name:'가',password:'short',confirm:'x'})).rejects.toThrow();
  const result=await members.register({email:' TEST@example.com ',name:'테스터',password:'password123',confirm:'password123'});
  expect(result.recoveryCode).toBeTruthy();expect(localStorage.getItem('accounts')).not.toContain('password123');
  await expect(members.register({email:'test@example.com',name:'테스터',password:'password123',confirm:'password123'})).rejects.toThrow(/이미/);
  await expect(members.login('test@example.com','wrong')).rejects.toThrow(/일치/);
  await members.login('test@example.com','password123');expect(members.current().name).toBe('테스터');
  members.update('새 이름');expect(members.current().name).toBe('새 이름');members.logout();expect(members.current()).toBeNull();
  expect(()=>members.update('이름')).toThrow(/로그인/);
  await members.login('test@example.com','password123');await expect(members.remove('wrong')).rejects.toThrow();
  await members.remove('password123');expect(members.current()).toBeNull();await expect(members.login('test@example.com','password123')).rejects.toThrow();
 });
 it('복구 코드로 재설정하고 기존 비밀번호와 세션을 폐기한다',async()=>{
  const m=setup();const r=await m.register({email:'a@example.com',name:'회원',password:'password123',confirm:'password123'});await m.login('a@example.com','password123');
  await expect(m.reset('a@example.com','bad','newpassword')).rejects.toThrow();
  await m.reset('a@example.com',r.recoveryCode,'newpassword');expect(m.current()).toBeNull();
  await expect(m.login('a@example.com','password123')).rejects.toThrow();await m.login('a@example.com','newpassword');
 });
});
