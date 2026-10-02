import {validBlock} from './course-blocks.js';
const key='enjoytrip.course-demo.v1';
const clone=value=>structuredClone(value);
const fail=message=>{throw Error(message);};
const text=(v,max=100)=>typeof v==='string'&&v.trim()&&v.trim().length<=max?v.trim():fail('입력 길이를 확인해주세요.');
const validStop=validBlock;
const validStops=stops=>Array.isArray(stops)&&stops.length<=30&&stops.every(validStop)&&new Set(stops.map(s=>s.id)).size===stops.length;
const validState=d=>d.plans.every(p=>p&&typeof p.id==='string'&&typeof p.owner==='string'&&typeof p.title==='string'&&p.input&&Number.isInteger(p.version)&&validStops(p.stops))&&d.courses.every(c=>c&&typeof c.id==='string'&&typeof c.owner==='string'&&['published','unpublished'].includes(c.status)&&Array.isArray(c.revisions)&&c.revisions.length>0&&c.revisions.every(r=>typeof r.id==='string'&&typeof r.title==='string'&&validStops(r.stops)))&&d.saved.every(s=>s&&typeof s.user==='string'&&typeof s.courseId==='string'&&typeof s.revisionId==='string')&&d.reviews.every(r=>r&&typeof r.user==='string'&&typeof r.courseId==='string'&&typeof r.body==='string'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5);
export function createCourseCommunity(storage){
 let raw;try{raw=storage.getItem(key);}catch{fail('코스 저장소를 읽지 못했습니다.');}
 let state={version:1,plans:[],courses:[],saved:[],reviews:[]};
 if(raw!==null){try{state=JSON.parse(raw);if(state.version!==1||!['plans','courses','saved','reviews'].every(k=>Array.isArray(state[k]))||!validState(state))throw Error();}catch{fail('코스 저장 데이터가 손상되었습니다. 원본은 유지됩니다.');}}
 function mutate(fn){const next=clone(state),result=fn(next);try{storage.setItem(key,JSON.stringify(next));}catch{fail('코스를 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도해주세요.');}state=next;return clone(result);}
 const actor=id=>text(id,128);
 const own=(data,id,user)=>{const p=data.plans.find(p=>p.id===id&&p.owner===user);if(!p)fail('계획을 찾을 수 없습니다.');return p;};
 const publicCourse=(data,id)=>{const c=data.courses.find(c=>c.id===id&&c.status==='published');if(!c)fail('공개 코스를 찾을 수 없습니다.');return c;};
 const rating=(id,revision)=>{const values=state.reviews.filter(r=>r.courseId===id&&(!revision||r.revisionId===revision)).map(r=>r.rating);return {count:values.length,average:values.length?values.reduce((a,b)=>a+b,0)/values.length:null};};
 const snapshot=p=>({id:crypto.randomUUID(),title:p.title,stops:p.stops.map(({id,title,area,tags,stay,cost,source,contentId,category,incomingMinutes,incomingCost})=>({id,title,area,tags:[...tags],stay,cost,source,contentId,category,incomingMinutes,incomingCost})),number:1});
 return {
 plans:user=>clone(state.plans.filter(p=>p.owner===user)),
 list:()=>clone(state.courses.filter(c=>c.status==='published').map(c=>({...c,revision:c.revisions.at(-1),rating:rating(c.id,c.revisions.at(-1).id)}))),
 course(id,revisionId){const c=publicCourse(state,id),revision=revisionId?c.revisions.find(r=>r.id===revisionId):c.revisions.at(-1);if(!revision)fail('코스 버전을 찾을 수 없습니다.');return clone({...c,revision,rating:rating(id,revision.id),reviews:state.reviews.filter(r=>r.courseId===id&&r.revisionId===revision.id)});},
 savePlan(user,plan,expected){actor(user);const title=text(plan.title);if(!validStops(plan.stops))fail('장소 목록을 확인해주세요.');return mutate(d=>{if(plan.id){const old=own(d,plan.id,user);if(old.version!==expected)fail('다른 변경이 있습니다. 계획을 다시 열어주세요.');Object.assign(old,{title,input:clone(plan.input),stops:clone(plan.stops),version:old.version+1,updatedAt:new Date().toISOString()});return old;}const p={id:crypto.randomUUID(),owner:user,title,input:clone(plan.input),stops:clone(plan.stops),version:1,updatedAt:new Date().toISOString(),source:plan.source||null,regionSource:plan.regionSource||null};d.plans.push(p);return p;});},
 deletePlan(user,id){return mutate(d=>{own(d,id,actor(user));d.plans=d.plans.filter(p=>p.id!==id);return true;});},
 publish(user,id,expected){return mutate(d=>{const p=own(d,id,actor(user));if(p.version!==expected)fail('계획이 변경되었습니다. 다시 확인해주세요.');if(!p.stops.length)fail('장소를 먼저 추가해주세요.');if(p.input.required?.some(id=>!p.stops.some(s=>s.id===id)))fail('필수 방문 장소가 누락되었습니다.');if(!p.input.blockEditor&&Number.isFinite(p.input.start)&&Number.isFinite(p.input.end)&&p.stops.reduce((sum,s)=>sum+s.stay,0)+Math.max(0,p.stops.length-1)*20>p.input.end-p.input.start)fail('여행 시간을 초과했습니다. 조건을 조정해주세요.');let c=d.courses.find(c=>c.owner===user&&c.planId===id);if(c?.planVersion===expected&&c.status==='published')return c;const revision=snapshot(p);if(!c){c={id:crypto.randomUUID(),owner:user,planId:id,status:'published',revisions:[]};d.courses.push(c);}revision.number=c.revisions.length+1;c.revisions.push(revision);c.status='published';c.planVersion=expected;return c;});},
 unpublish(user,id){return mutate(d=>{const c=d.courses.find(c=>c.id===id&&c.owner===actor(user));if(!c)fail('내 코스만 비공개로 바꿀 수 있습니다.');c.status='unpublished';return true;});},
 save(user,id,revisionId){return mutate(d=>{actor(user);const c=publicCourse(d,id),rev=revisionId?c.revisions.find(r=>r.id===revisionId):c.revisions.at(-1);if(!rev)fail('버전을 찾을 수 없습니다.');const old=d.saved.find(s=>s.user===user&&s.courseId===id);if(old)return old;const s={user,courseId:id,revisionId:rev.id};d.saved.push(s);return s;});},
 unsave(user,id){return mutate(d=>{d.saved=d.saved.filter(s=>!(s.user===actor(user)&&s.courseId===id));return true;});},
 saved(user){return clone(state.saved.filter(s=>s.user===user).map(s=>{const c=state.courses.find(c=>c.id===s.courseId);return {...s,available:c?.status==='published',revision:c?.status==='published'?c.revisions.find(r=>r.id===s.revisionId):null,hasNewRevision:c?.revisions.at(-1).id!==s.revisionId};}));},
 copy(user,id,revisionId){const c=this.course(id,revisionId);return this.savePlan(user,{title:c.revision.title,input:{area:c.revision.stops[0]?.area||'',blockEditor:true,required:[]},stops:c.revision.stops,source:{courseId:id,revisionId:c.revision.id}});},
 review(user,id,ratingValue,body,revisionId){actor(user);if(!Number.isInteger(ratingValue)||ratingValue<1||ratingValue>5)fail('별점은 1~5점입니다.');body=text(body,2000);return mutate(d=>{const c=publicCourse(d,id);if(c.owner===user)fail('본인 코스에는 리뷰를 남길 수 없습니다.');const rev=revisionId?c.revisions.find(r=>r.id===revisionId):c.revisions.at(-1);if(!rev)fail('버전을 찾을 수 없습니다.');let r=d.reviews.find(r=>r.user===user&&r.courseId===id);if(!r){r={user,courseId:id};d.reviews.push(r);}Object.assign(r,{rating:ratingValue,body,revisionId:rev.id});return r;});},
 deleteReview(user,id){return mutate(d=>{d.reviews=d.reviews.filter(r=>!(r.user===actor(user)&&r.courseId===id));return true;});}
 };
}
