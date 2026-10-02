import {it,expect} from 'vitest';
import {simulateThrow,gestureThrow} from '../src/modules/random-trip.js';
it('RND-14 극단적인 방향·세기·스핀에도 착지가 보드 안에 남는다',()=>{for(const vx of [-10000,0,10000])for(const vy of [-10000,-80])for(const spin of [-6,6]){const points=simulateThrow({vx,vy,spin}),last=points.at(-1);expect(last.x).toBeGreaterThan(0);expect(last.x).toBeLessThan(800);expect(last.y).toBeGreaterThan(0);expect(last.y).toBeLessThan(500);expect(points[0].z).toBeGreaterThan(last.z);}});
it('RND-14 동일한 쓸기 거리는 손속도가 달라도 같은 목표를 만든다',()=>{const gesture=t=>gestureThrow([{x:400,y:550,t:0},{x:420,y:430,t}]);expect(gesture(60)).toEqual(gesture(110));});

it('RND-15 가까운 육지만 보정하고 먼 바다/보드 밖은 보정하지 않는다',async()=>{const {assistLanding}=await import('../src/modules/random-trip.js');const target={x:440,y:250};expect(assistLanding({x:400,y:250},[target])).toBe(target);expect(assistLanding({x:100,y:250},[target])).toBeNull();expect(assistLanding({x:0,y:0},[{x:-2,y:0}])).toBeNull();});

it('RND-17 비행은 놓은 위치에서 시작하고 기존 목표 범위를 유지한다',()=>{const p=simulateThrow({vx:0,vy:-220,spin:0,origin:{x:450,y:350,z:120}});expect(p[0].x).toBe(450);expect(p[0].y).toBe(350);expect(p.at(-1).y).toBeGreaterThan(0);expect(p.at(-1).y).toBeLessThan(500);});
