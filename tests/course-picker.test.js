import {it,expect,vi,afterEach} from 'vitest';
import {mountCoursePicker} from '../src/course-picker.js';
let picker;afterEach(()=>{picker?.destroy();document.body.replaceChildren();});
const bag={list:()=>[],add:vi.fn()};
it('CB-FLOW-01 조회 실패 재시도와 빈 결과를 구분한다',async()=>{
 document.body.innerHTML='<div id="picker"></div>';const findPage=vi.fn().mockRejectedValueOnce(Error('private upstream')).mockResolvedValueOnce({places:[],mode:'sample',pageNo:1});
 picker=mountCoursePicker(document.querySelector('#picker'),{tour:{findPage},bag,actor:'fixture',state:{},onChange:()=>{}});
 await vi.waitFor(()=>expect(document.querySelector('[data-picker-status]').textContent).toContain('불러오지 못했습니다'));expect(document.body.textContent).not.toContain('private upstream');document.querySelector('[data-picker-retry]').click();
 await vi.waitFor(()=>expect(document.querySelector('[data-picker-status]').textContent).toContain('다른 지역'));expect(findPage).toHaveBeenCalledTimes(2);
});
it('CB-FLOW-01 단계 이탈 후 늦은 조회는 상태를 덮어쓰지 않는다',async()=>{
 document.body.innerHTML='<div id="picker"></div>';let resolve,signal;const state={};picker=mountCoursePicker(document.querySelector('#picker'),{tour:{findPage:options=>{signal=options.signal;return new Promise(r=>resolve=r);}},bag,actor:'fixture',state,onChange:()=>{}});picker.destroy();expect(signal.aborted).toBe(true);resolve({places:[{title:'late'}],mode:'sample'});await Promise.resolve();expect(state.places).toBeUndefined();
});
