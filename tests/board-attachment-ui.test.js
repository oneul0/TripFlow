import {it,expect} from 'vitest';
import {mountAttachment} from '../src/board-attachment-ui.js';
it('F110-COURSE-02 초기 지정 코스 조회가 끝날 때까지 저장을 막는다',async()=>{
 document.body.innerHTML='<div id="attachment"></div>';let finish;let busy=false;
 const widget=mountAttachment(document.querySelector('#attachment'),{courseId:'p',members:{current:()=>({id:'u'})},courseService:{listMine:()=>new Promise(resolve=>finish=resolve),get:async()=>null},onBusy:v=>busy=v});
 expect(busy).toBe(true);finish([]);await widget.ready;expect(busy).toBe(false);expect(widget.value()).toBeNull();
});

it('F110-COURSE-10 늦은 조회가 최신 선택을 덮어쓰지 않는다',async()=>{
 document.body.innerHTML='<div id="attachment"></div>';const pending={};
 const course=id=>({id,ownerId:'u',updatedAt:'2026-10-02T00:00:00Z',title:id,places:[{contentId:id,source:'sample',title:'<script>합성</script>',address:'',latitude:null,longitude:null}],totalDistanceMeters:null,totalDurationSeconds:null,costBasis:null});
 const widget=mountAttachment(document.querySelector('#attachment'),{members:{current:()=>({id:'u'})},courseService:{listMine:async()=>[{id:'a',title:'a'},{id:'b',title:'b'}],get:id=>new Promise(resolve=>pending[id]=resolve)}});
 await widget.ready;const select=document.querySelector('select');select.value='a';select.dispatchEvent(new Event('change'));select.value='b';select.dispatchEvent(new Event('change'));
 pending.b(course('b'));await Promise.resolve();pending.a(course('a'));await Promise.resolve();
 expect(widget.value().sourceCourseId).toBe('b');expect(document.querySelector('[data-attachment-preview] script')).toBeNull();expect(document.querySelector('[data-attachment-preview] li').textContent).toContain('<script>');
 document.querySelector('[data-attachment-remove]').click();expect(widget.value()).toBeNull();
});
