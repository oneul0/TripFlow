const clamp=n=>Math.max(0,Math.min(1,n));
const burden=(value,target)=>value<=target?1:clamp(2-value/target);
export function evaluateFit(input,facts,{revisionId='draft',now='2026-10-02T00:00:00Z'}={}){
 const dimensions=[{id:'interest',active:!!input.tags?.length,value:facts.interest},{id:'travel',active:input.travelTarget>0,value:facts.travelMinutes==null?null:burden(facts.travelMinutes,input.travelTarget)},{id:'pace',active:!!input.pace,value:facts.visits==null?null:clamp(1-Math.max(input.pace?.[0]-facts.visits, facts.visits-input.pace?.[1],0)/(input.pace?.[1]||1))},{id:'budget',active:input.budget>0,value:facts.cost==null?null:burden(facts.cost,input.budget)}].map(d=>({...d,value:Number.isFinite(d.value)?clamp(d.value):null,weight:input.importance?.[d.id]||2}));
 const active=dimensions.filter(d=>d.active),known=active.filter(d=>d.value!==null),total=active.reduce((n,d)=>n+d.weight,0),weight=known.reduce((n,d)=>n+d.weight,0),coverage=total?weight/total:0;
 const violated=(input.maxBudget!=null&&facts.cost!=null&&facts.cost>input.maxBudget)||(input.maxTravel!=null&&facts.travelMinutes!=null&&facts.travelMinutes>input.maxTravel);
 const incomplete=(input.maxBudget!=null&&facts.cost==null)||(input.maxTravel!=null&&facts.travelMinutes==null)||facts.complete===false;
 const status=violated?'ineligible':incomplete?'incomplete':known.length<2||coverage<.75?'insufficient_data':'ready';
 return {status,score:status==='ready'?Math.round(100*known.reduce((n,d)=>n+d.value*d.weight,0)/weight):null,coverage,dimensions,policyVersion:'sample-fit-1',revisionId,generatedAt:now,missingFields:active.filter(d=>d.value===null).map(d=>d.id)};
}
export function generateCourse(input,places,{signal}={}){
 signal?.throwIfAborted();
 if(!input.area||!Number.isInteger(input.start)||!Number.isInteger(input.end)||input.start<0||input.end>1440||input.end<=input.start)throw Error('지역과 올바른 여행 시간을 선택해주세요.');
 const pool=places.filter(p=>p.area===input.area),required=input.required||[];
 if(required.some(id=>!pool.some(p=>p.id===id)))return {status:'infeasible',stops:[],message:'필수 장소를 이 지역의 샘플에서 찾을 수 없습니다.'};
 const ranked=[...pool].sort((a,b)=>Number(required.includes(b.id))-Number(required.includes(a.id))||Number(b.tags.some(t=>input.tags?.includes(t)))-Number(a.tags.some(t=>input.tags?.includes(t)))||a.id.localeCompare(b.id));
 const stops=[];let time=input.start;
 for(const p of ranked){signal?.throwIfAborted();const arrival=time+(stops.length?20:0);if(arrival+p.stay>input.end||stops.length>=8){if(required.includes(p.id))return {status:'infeasible',stops:[],message:'필수 장소를 모두 방문하기에는 시간이 부족합니다.'};continue;}stops.push({...p,arrival,departure:arrival+p.stay});time=arrival+p.stay;if(stops.length>=3&&required.every(id=>stops.some(s=>s.id===id)))break;}
 return {status:stops.length?'generated':'unavailable',stops,message:stops.length?'합성 구간 20분·샘플 체류시간으로 만든 당일 초안입니다. 실제 경로가 아닙니다.':'선택 지역의 코스 샘플이 없습니다.'};
}
export function courseFacts(stops,input){return {interest:stops.length?stops.filter(p=>p.tags.some(t=>input.tags?.includes(t))).length/stops.length:null,travelMinutes:stops.length?Math.max(0,stops.length-1)*20:null,visits:stops.length,cost:stops.every(p=>Number.isFinite(p.cost))?stops.reduce((n,p)=>n+p.cost,0):null,complete:stops.length>0};}
