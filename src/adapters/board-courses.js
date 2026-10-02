import {blockTotals} from '../modules/course-blocks.js';
export function createBoardCourses({community,members}){
 function mine(id){const member=members.current();if(!member||id&&id!==member.id)throw Error('본인 코스를 보려면 로그인해주세요.');if(!community)throw Error('코스 저장소를 읽을 수 없습니다.');return community.plans(member.id);}
 function convert(p){if(!p.updatedAt)throw Error('코스를 다시 저장한 뒤 첨부해주세요.');return {id:p.id,ownerId:p.owner,title:p.title,updatedAt:p.updatedAt,places:p.stops.map(s=>({contentId:s.contentId||s.id,source:s.source||'sample',title:s.title,address:'',latitude:null,longitude:null})),totalDistanceMeters:null,totalDurationSeconds:null,costBasis:null,estimates:blockTotals(p.stops)};}
 return {async get(id){const p=mine().find(p=>p.id===id);return p?convert(p):null;},async listMine(id){return mine(id).filter(p=>p.stops.length&&p.updatedAt).map(convert);}};
}
