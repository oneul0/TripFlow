import {attachCourse,copyAttachment} from './modules/course-attachment.js';
export function renderAttachment(root,attachment){
 root.replaceChildren();if(!attachment)return;
 const heading=document.createElement('h3');heading.textContent=attachment.title;
 const note=document.createElement('p');note.textContent='첨부 당시 코스 · 원본 변경과 무관하게 유지됩니다.';
 const list=document.createElement('ol');for(const place of attachment.places){const li=document.createElement('li');li.textContent=place.title;list.append(li);}
 root.append(heading,note,list);
 if(attachment.places.some(p=>p.source==='sample')){const p=document.createElement('p');p.textContent='합성 장소를 포함한 체험 코스입니다.';root.append(p);}
 if(attachment.costBasis){const p=document.createElement('p');p.textContent=[attachment.costBasis==='estimate'?'추정':'도로 경로 기준',attachment.totalDistanceMeters===null?null:`이동 거리 ${attachment.totalDistanceMeters}m`,attachment.totalDurationSeconds===null?null:`이동 시간 ${Math.round(attachment.totalDurationSeconds/60)}분`].filter(Boolean).join(' · ');root.append(p);}
}
export function mountAttachment(root,{courseService,members,initial=null,courseId='',isActive=()=>true,onBusy=()=>{}}){
 let value=copyAttachment(initial),token=0;
 root.innerHTML='<fieldset><legend>코스 첨부 (선택)</legend><label for="board-course-select">저장한 코스 선택</label><select id="board-course-select"><option value="">코스를 선택해주세요</option></select><button type="button" data-attachment-remove>첨부 해제</button><button type="button" data-attachment-retry>코스 다시 조회</button><p role="status" data-attachment-status></p><div data-attachment-preview></div></fieldset>';
 const select=root.querySelector('select'),message=root.querySelector('[data-attachment-status]'),preview=root.querySelector('[data-attachment-preview]');
 const show=()=>renderAttachment(preview,value);show();
 async function choose(id){
  const request=++token;if(!id){value=null;show();message.textContent='첨부를 해제했습니다.';onBusy(false);return;}
  const memberId=members.current()?.id;onBusy(true);message.textContent='코스를 불러오고 있습니다…';
  try{const course=await courseService.get(id);if(!isActive()||request!==token)return;if(members.current()?.id!==memberId)throw Error('로그인한 회원이 변경되었습니다. 다시 선택해주세요.');value=attachCourse(course,memberId);show();message.textContent='코스를 첨부했습니다.';}
  catch(error){if(isActive()&&request===token)message.textContent=error.message;}
  finally{if(isActive()&&request===token)onBusy(false);}
 }
 async function load(){
  const memberId=members.current()?.id;message.textContent='저장한 코스를 확인하고 있습니다…';
  try{const courses=await courseService.listMine(memberId);if(!isActive()||members.current()?.id!==memberId)return;const selected=select.value;select.replaceChildren(new Option('코스를 선택해주세요',''));for(const c of courses)select.add(new Option(c.title,c.id));select.value=selected;message.textContent=courses.length?'본인 저장 코스를 첨부할 수 있습니다.':'저장한 코스가 없습니다. 코스를 먼저 저장해주세요.';}
  catch(error){if(isActive())message.textContent=error.message;}
 }
 select.addEventListener('change',()=>choose(select.value));root.querySelector('[data-attachment-remove]').addEventListener('click',()=>{select.value='';choose('');});
 root.querySelector('[data-attachment-retry]').addEventListener('click',async()=>{await load();if(isActive()&&(select.value||courseId))choose(select.value||courseId);});
 if(courseId)onBusy(true);
 const ready=load().then(()=>{if(isActive()&&courseId)return choose(courseId);});
 return {value:()=>copyAttachment(value),ready};
}
