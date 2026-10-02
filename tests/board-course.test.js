import {it,expect} from 'vitest';
import {createBoard,validPosts} from '../src/modules/board.js';
const attachment=()=>({sourceCourseId:'p1',sourceUpdatedAt:'2026-10-02T00:00:00.000Z',title:'원본 코스',places:[{contentId:'b',source:'sample',title:'두번째 이름',address:'',latitude:null,longitude:null},{contentId:'a',source:'sample',title:'첫번째 이름',address:'',latitude:null,longitude:null}],totalDistanceMeters:null,totalDurationSeconds:null,costBasis:null});
it('F110-COURSE-03~08 첨부는 깊은 복사, 생략 수정은 유지, null은 해제한다',()=>{
 let rows=[];const board=createBoard({posts:{read:()=>structuredClone(rows),write:v=>rows=structuredClone(v)},members:{current:()=>({id:'u',name:'합성'})}});
 const original=attachment(),post=board.create({title:'후기',content:'본문',category:'course',courseAttachment:original});
 original.places[0].title='원본 수정';expect(board.get(post.id).courseAttachment.places[0].title).toBe('두번째 이름');
 post.courseAttachment.places.reverse();expect(board.get(post.id).courseAttachment.places.map(p=>p.contentId)).toEqual(['b','a']);
 board.update(post.id,{title:'수정',content:'본문 수정',category:'review'});expect(board.get(post.id).courseAttachment.title).toBe('원본 코스');
 expect(validPosts(rows)).toBe(true);board.update(post.id,{title:'수정',content:'본문',courseAttachment:null});expect(board.get(post.id).courseAttachment).toBeNull();
});
it('F110-COURSE-06/09 기존 첨부 없는 글 호환과 잘못된 좌표 거절',()=>{
 const a=attachment();a.places[0].latitude=100;
 const post={id:'p',authorId:'u',authorName:'합성',title:'제목',content:'본문',category:'review',createdAt:'2026-10-02T00:00:00Z',updatedAt:'2026-10-02T00:00:00Z'};
 expect(validPosts([post])).toBe(true);expect(validPosts([{...post,courseAttachment:a}])).toBe(false);
});
