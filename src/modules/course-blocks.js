import {createStore} from '../adapters/storage.js';
const bounded=(n,max)=>n===null||(Number.isFinite(n)&&n>=0&&n<=max);
export function validBlock(s){return !!s&&typeof s.id==='string'&&s.id.length>0&&s.id.length<=128&&typeof s.title==='string'&&s.title.trim().length>0&&s.title.length<=200&&typeof s.area==='string'&&Array.isArray(s.tags)&&s.tags.every(t=>typeof t==='string')&&(s.stay===null||Number.isInteger(s.stay)&&s.stay>0&&s.stay<=1440)&&bounded(s.cost,10000000)&&(s.source===undefined||['sample','tourapi'].includes(s.source))&&(s.incomingMinutes===undefined||bounded(s.incomingMinutes,1440))&&(s.incomingCost===undefined||bounded(s.incomingCost,10000000));}
export function toBlock(place,source){
 const contentId=String(place.contentId??'');
 const block={id:source==='tourapi'?`tourapi:${contentId}`:contentId,contentId,source,title:place.title,area:String(place.areaCode??''),category:String(place.contentTypeId??''),tags:[],stay:null,cost:null,incomingMinutes:null,incomingCost:null};
 if(!contentId||!validBlock(block)||!['sample','tourapi'].includes(source))throw Error('장소 정보를 확인해주세요.');return block;
}
export function createCandidateBag(storage){
 const store=createStore(storage,'enjoytrip.course-candidates.v1',[],rows=>Array.isArray(rows)&&rows.every(r=>typeof r.owner==='string'&&Array.isArray(r.items)&&r.items.length<=100&&r.items.every(validBlock)));
 return {list:owner=>structuredClone(store.read().find(r=>r.owner===owner)?.items||[]),add(owner,block){if(!validBlock(block))throw Error('장소 정보를 확인해주세요.');const rows=store.read();let row=rows.find(r=>r.owner===owner);if(!row){row={owner,items:[]};rows.push(row);}if(row.items.some(p=>p.id===block.id))return false;if(row.items.length>=100)throw Error('후보는 최대 100곳까지 담을 수 있습니다.');row.items.push(structuredClone(block));store.write(rows);return true;},remove(owner,id){const rows=store.read();const row=rows.find(r=>r.owner===owner);if(row)row.items=row.items.filter(p=>p.id!==id);store.write(rows);}};
}
export function blockTotals(stops){
 let minutes=0,cost=0,timeComplete=stops.length>0,costComplete=stops.length>0;
 for(const [i,s] of stops.entries()){for(const v of [s.stay,...(i?[s.incomingMinutes]:[])]){if(Number.isFinite(v))minutes+=v;else timeComplete=false;}for(const v of [s.cost,...(i?[s.incomingCost]:[])]){if(Number.isFinite(v))cost+=v;else costComplete=false;}}
 return {minutes,cost,timeComplete,costComplete};
}
export function reconnectBlocks(before,after){return after.map((s,i)=>{const oldIndex=before.findIndex(p=>p.id===s.id);return oldIndex>=0&&before[oldIndex-1]?.id===after[i-1]?.id?{...s}:{...s,incomingMinutes:null,incomingCost:null};});}
export function reorderBlocks(stops,from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=stops.length||to>=stops.length)throw Error('이동할 위치를 확인해주세요.');const next=[...stops];next.splice(to,0,next.splice(from,1)[0]);return reconnectBlocks(stops,next);}
