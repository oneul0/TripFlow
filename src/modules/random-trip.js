import {pointInGeometry} from './regions.js';
export {simulateThrow,THROW_ORIGIN} from '../adapters/throw-physics.js';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function gestureThrow(samples){
 if(samples.length<2)return null;
 const end=samples.at(-1),recent=samples.filter(p=>end.t-p.t<=120);if(recent.length<2)return null;
 const start=samples[0];if(end.t<=start.t||end.y-start.y>-18)return null;
 const vx=clamp((end.x-start.x)*1.1,-240,240),vy=-clamp((start.y-end.y)*1.8,80,380);
 return {vx,vy,spin:gestureSpin(samples).spin};
}
export function gestureSpin(samples){
 let heading=null,turn=0;
 for(let i=1;i<samples.length;i++){
  const dx=samples[i].x-samples[i-1].x,dy=samples[i].y-samples[i-1].y;if(Math.hypot(dx,dy)<5)continue;
  const next=Math.atan2(dy,dx);if(heading!==null){const delta=Math.atan2(Math.sin(next-heading),Math.cos(next-heading));if(Math.abs(delta)<2.5)turn+=delta;}heading=next;
 }
 return {spin:clamp(turn*.6,-6,6),angle:turn*180/Math.PI};
}
export function hitRegion(point,regions){return [...regions].sort((a,b)=>a.id.localeCompare(b.id)).find(r=>pointInGeometry(point,r.geometry))||null;}

const storageKey='enjoytrip.random-candidates.v1';
const validItem=item=>item&&['id','name','path','boundaryVersion','addedAt'].every(k=>typeof item[k]==='string'&&item[k].length>0&&item[k].length<300)&&Number.isFinite(Date.parse(item.addedAt));
export function createCandidateBag(storage){
 let items=[],error=null,previous=null;
 try{const raw=storage.getItem(storageKey);if(raw!==null){const data=JSON.parse(raw);if(data?.version!==1||!Array.isArray(data.items)||data.items.length>10000||!data.items.every(validItem)||new Set(data.items.map(i=>i.id)).size!==data.items.length)throw Error();items=data.items.map(({id,name,path,boundaryVersion,addedAt})=>({id,name,path,boundaryVersion,addedAt}));}}catch{error='read';}
 function save(){if(error==='read')return;try{storage.setItem(storageKey,JSON.stringify({version:1,items}));error=null;}catch{error='write';}}
 return {
  get items(){return items.map(i=>({...i}));},get error(){return error;},get canUndo(){return previous!==null;},
  add(region){if(error==='read'||items.some(i=>i.id===region.id))return false;previous=items;items=[...items,{id:region.id,name:region.name,path:region.path||`서울특별시 ${region.name}`,boundaryVersion:region.boundaryVersion||'KOSTAT-2013',addedAt:new Date().toISOString()}];save();return true;},
  remove(id){if(error==='read'||!items.some(i=>i.id===id))return;previous=items;items=items.filter(i=>i.id!==id);save();},
  undo(){if(previous===null||error==='read')return;items=previous;previous=null;save();},
  retry:save,reset(){items=[];previous=null;error=null;save();}
 };
}

export function assistLanding(point,targets,radius=90){
 let nearest=null,distance=radius;
 for(const target of targets){const d=Math.hypot(point.x-target.x,point.y-target.y);if(d<distance&&target.x>=20&&target.x<=780&&target.y>=20&&target.y<=500){nearest=target;distance=d;}}
 return nearest;
}
