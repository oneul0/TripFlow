import {it,expect} from 'vitest';
import {renderHomeStories} from '../src/home-stories.js';
it('EDIT-01 최신 글 최대 세 개를 안전한 실제 링크로 제공한다',()=>{
 const root=document.createElement('div');
 const posts=Array.from({length:4},(_,i)=>({id:`post/${i}`,title:'<img onerror=alert(1)>',content:'여행 이야기',authorName:'테스터',createdAt:'2026-10-02',sample:true}));
 renderHomeStories(root,{list:()=>posts});
 expect(root.querySelectorAll('a')).toHaveLength(3);
 expect(root.querySelector('a').getAttribute('href')).toBe('#board/post/post%2F0');
 expect(root.querySelector('img')).toBeNull();
 expect(root.textContent).toContain('샘플');
 expect(root.textContent).toContain('<img onerror=alert(1)>');
});
it('EDIT-01 빈 결과와 실패를 구분하고 재시도한다',()=>{
 const root=document.createElement('div');let fail=true;
 const board={list(){if(fail)throw Error('private');return [];}};
 renderHomeStories(root,board);expect(root.textContent).not.toContain('private');
 expect(root.querySelector('button')).not.toBeNull();fail=false;root.querySelector('button').click();
 expect(root.textContent).toContain('첫 여행 이야기');
 expect(root.querySelector('button')).toBeNull();
});
