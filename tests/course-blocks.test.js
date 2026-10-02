import {it,expect} from 'vitest';
import {createCandidateBag,toBlock,blockTotals,reorderBlocks} from '../src/modules/course-blocks.js';
import {createCourseCommunity} from '../src/modules/course-community.js';
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
const place=id=>({contentId:id,title:'관광지 '+id,areaCode:'1',contentTypeId:'12'});
it('CB-01 후보 출처·중복·사용자 격리와 복원',()=>{const storage=memory(),bag=createCandidateBag(storage);bag.add('a',toBlock(place('1'),'tourapi'));bag.add('a',toBlock(place('1'),'tourapi'));bag.add('a',toBlock(place('1'),'sample'));expect(createCandidateBag(storage).list('a')).toHaveLength(2);expect(bag.list('b')).toEqual([]);expect(bag.list('a')[0].source).toBe('tourapi');});
it('CB-03 미확인은 0이 아니며 바뀐 구간만 초기화한다',()=>{const stops=['1','2','3'].map(id=>({...toBlock(place(id),'sample'),stay:60,cost:1000,incomingMinutes:20,incomingCost:500}));expect(blockTotals(stops)).toEqual({minutes:220,cost:4000,timeComplete:true,costComplete:true});const moved=reorderBlocks(stops,2,0);expect(moved[1].incomingMinutes).toBeNull();expect(moved[2].incomingMinutes).toBe(20);expect(blockTotals(moved).timeComplete).toBe(false);expect(blockTotals([{...stops[0],cost:null}]).costComplete).toBe(false);});
it('CB-04 실제 출처와 미확인 값은 공유·복사·복원에서도 유지',()=>{const storage=memory(),s=createCourseCommunity(storage),stop=toBlock(place('1'),'tourapi');const p=s.savePlan('a',{title:'블록 코스',input:{blockEditor:true},stops:[stop]});const c=s.publish('a',p.id,p.version);const copy=s.copy('b',c.id);expect(copy.stops[0].source).toBe('tourapi');expect(copy.stops[0].stay).toBeNull();copy.stops[0].cost=5000;s.savePlan('b',copy,copy.version);expect(createCourseCommunity(storage).course(c.id).revision.stops[0].cost).toBeNull();});
it('CB-06 후보 저장 실패·손상은 원본을 유지',()=>{const bag=createCandidateBag({getItem:()=>null,setItem:()=>{throw Error('quota');}});expect(()=>bag.add('a',toBlock(place('1'),'sample'))).toThrow();expect(bag.list('a')).toEqual([]);expect(()=>createCandidateBag({getItem:()=>'{bad'}).list('a')).toThrow();});

it('CB-04 게시판 첨부도 시간·금액 합계와 출처를 보존한다',async()=>{
 const {createBoardCourses}=await import('../src/adapters/board-courses.js');const {attachCourse}=await import('../src/modules/course-attachment.js');
 const s=createCourseCommunity(memory());const p=s.savePlan('a',{title:'실제 장소 후보',input:{blockEditor:true},stops:[{...toBlock(place('1'),'tourapi'),stay:45,cost:7000}]});
 const adapter=createBoardCourses({community:s,members:{current:()=>({id:'a'})}});const attachment=attachCourse(await adapter.get(p.id),'a');expect(attachment.places[0].source).toBe('tourapi');expect(attachment.estimates).toEqual({minutes:45,cost:7000,timeComplete:true,costComplete:true});
});
