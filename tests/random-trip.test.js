import {describe,it,expect} from 'vitest';
import {simulateThrow,gestureThrow,hitRegion,createCandidateBag} from '../src/modules/random-trip.js';
const square={id:'1',name:'테스트구',geometry:{type:'Polygon',coordinates:[[[0,0],[10,0],[10,10],[0,10],[0,0]]]}};
const memory=()=>{let raw=null;return {getItem:()=>raw,setItem:(_,v)=>{raw=v;}};};
describe('RND 물리와 착지',()=>{
 it('포물선은 첫 착지에서 끝나고 더 빠른 공은 멀리 간다',()=>{const a=simulateThrow({vx:0,vy:-160,spin:0}),b=simulateThrow({vx:0,vy:-300,spin:0});expect(a.at(-1).z).toBe(0);expect(a.some(p=>p.z>50)).toBe(true);expect(b.at(-1).y).toBeLessThan(a.at(-1).y);expect(simulateThrow({vx:0,vy:-160,spin:0})).toEqual(a);});
 it('반대 스핀은 반대 커브, 입력 상한과 비정상 입력을 처리한다',()=>{const a=simulateThrow({vx:0,vy:-200,spin:3}).at(-1),b=simulateThrow({vx:0,vy:-200,spin:-3}).at(-1);expect(a.x-400).toBeCloseTo(400-b.x);expect(Math.abs(a.x-400)).toBeGreaterThan(20);expect(()=>simulateThrow({vx:NaN,vy:0,spin:0})).toThrow();expect(simulateThrow({vx:1e6,vy:-1e6,spin:1e6}).length).toBeLessThan(400);});
 it('위로 쓸기만 발사하고 느린 놓기와 정지는 취소한다',()=>{expect(gestureThrow([{x:400,y:560,t:0},{x:420,y:400,t:100}]).vy).toBeLessThan(0);expect(gestureThrow([{x:400,y:560,t:0},{x:400,y:559,t:100}])).toBeNull();expect(gestureThrow([{x:400,y:560,t:0},{x:400,y:400,t:100},{x:400,y:400,t:400}])).toBeNull();});
 it('원형 입력 방향으로 스핀을 구분한다',()=>{const trace=sign=>Array.from({length:25},(_,i)=>({x:400+40*Math.cos(i*Math.PI/6),y:480+sign*40*Math.sin(i*Math.PI/6),t:i*20})).concat([{x:400,y:350,t:520},{x:400,y:250,t:560}]);expect(gestureThrow(trace(1)).spin*gestureThrow(trace(-1)).spin).toBeLessThan(0);});
 it('경계 동률, 구멍, 다중 폴리곤과 바깥을 판정한다',()=>{expect(hitRegion([0,5],[{...square,id:'2'},square]).id).toBe('1');expect(hitRegion([11,5],[square])).toBeNull();const hole={...square,geometry:{type:'Polygon',coordinates:[square.geometry.coordinates[0],[[2,2],[8,2],[8,8],[2,8],[2,2]]]}};expect(hitRegion([5,5],[hole])).toBeNull();expect(hitRegion([1,1],[{...square,geometry:{type:'MultiPolygon',coordinates:[square.geometry.coordinates]}}]).id).toBe('1');});
});
describe('RND 후보 저장',()=>{
 it('중복 제외, 복원, 삭제와 실행 취소',()=>{const storage=memory(),bag=createCandidateBag(storage);expect(bag.add(square)).toBe(true);expect(bag.add(square)).toBe(false);expect(createCandidateBag(storage).items).toHaveLength(1);bag.remove('1');expect(bag.items).toHaveLength(0);bag.undo();expect(bag.items).toHaveLength(1);expect(JSON.stringify(bag.items)).not.toContain('geometry');});
 it('쓰기 실패는 목록 유지 후 재시도한다',()=>{const storage=memory(),save=storage.setItem;storage.setItem=()=>{throw Error('secret');};const bag=createCandidateBag(storage);bag.add(square);expect(bag.items).toHaveLength(1);expect(bag.error).toBe('write');storage.setItem=save;bag.retry();expect(bag.error).toBeNull();});
 it('손상 데이터는 초기화 전 덮어쓰지 않는다',()=>{let writes=0;const bag=createCandidateBag({getItem:()=>'{bad',setItem:()=>writes++});expect(bag.error).toBe('read');bag.add(square);expect(writes).toBe(0);bag.reset();expect(bag.error).toBeNull();expect(writes).toBe(1);});
});
