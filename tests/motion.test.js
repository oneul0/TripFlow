import {it,expect,vi,afterEach} from 'vitest';
import {installMotion} from '../src/motion.js';
afterEach(()=>{vi.useRealTimers();document.body.replaceChildren();});
it('일반 클릭에는 파티클이 없고 성공 이벤트에만 생성 후 제거된다',()=>{
 vi.useFakeTimers();document.body.innerHTML='<main><button>검색</button></main>';
 installMotion(document.querySelector('main'),{reduced:{matches:false}});
 document.querySelector('button').click();expect(document.querySelectorAll('.burst-particle')).toHaveLength(0);
 document.querySelector('main').dispatchEvent(new CustomEvent('enjoytrip:success',{detail:{target:document.querySelector('button')}}));
 expect(document.querySelectorAll('.burst-particle')).toHaveLength(22);
 vi.advanceTimersByTime(800);expect(document.querySelectorAll('.burst-particle')).toHaveLength(0);
});
it('모션 줄이기를 선택하면 파티클을 생성하지 않는다',()=>{
 document.body.innerHTML='<main><button>검색</button></main>';
 installMotion(document.querySelector('main'),{reduced:{matches:true}});
 document.querySelector('main').dispatchEvent(new CustomEvent('enjoytrip:success',{detail:{target:document.querySelector('button')}}));expect(document.querySelector('.burst-particle')).toBeNull();
});
