import {it,expect} from 'vitest';
import {createCourseCommunity} from '../src/modules/course-community.js';
import {createBoardCourses} from '../src/adapters/board-courses.js';
it('F110-COURSE-01/09 기존 코스를 회원 ID로 조회하고 타인 계획은 제공하지 않는다',async()=>{
 const community=createCourseCommunity({getItem:()=>null,setItem:()=>{}}),members={current:()=>({id:'member-1'})};
 const plan=community.savePlan('member-1',{title:'합성 코스',input:{},stops:[{id:'a',title:'첫 장소',area:'1',tags:[],stay:60,cost:0}]});
 const foreign=community.savePlan('other',{title:'타인 코스',input:{},stops:plan.stops});const service=createBoardCourses({community,members});
 const course=await service.get(plan.id);expect(course).toMatchObject({ownerId:'member-1',totalDurationSeconds:null,costBasis:null});expect(course.places[0]).toMatchObject({contentId:'a',source:'sample',latitude:null});
 expect(await service.get(foreign.id)).toBeNull();expect(await service.listMine('member-1')).toHaveLength(1);await expect(service.listMine('other')).rejects.toThrow();
});
