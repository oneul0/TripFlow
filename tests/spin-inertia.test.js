import {it,expect} from 'vitest';
import {createSpinInertia} from '../src/adapters/throw-physics.js';
it('RND-SPIN-01 입력이 멈춰도 같은 방향으로 돌며 감속하고 초기화한다',()=>{const s=createSpinInertia();s.kick(90,4);const a=s.angle;s.step(.1);expect(s.angle).toBeGreaterThan(a);expect(s.spin).toBeGreaterThan(0);expect(s.spin).toBeLessThan(4);for(let i=0;i<100;i++)s.step(.1);expect(s.spin).toBe(0);s.reset();expect(s.angle).toBe(0);});
it('RND-SPIN-01 반대 방향과 프레임 간격 독립 감쇠',()=>{const a=createSpinInertia(),b=createSpinInertia();a.kick(-90,-3);b.kick(-90,-3);for(let i=0;i<60;i++)a.step(1/60);for(let i=0;i<120;i++)b.step(1/120);expect(a.spin).toBeCloseTo(b.spin,4);expect(a.angle).toBeLessThan(-90);});
