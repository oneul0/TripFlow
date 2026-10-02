import {it,expect,vi} from 'vitest';
import {mountClassification} from '../src/classification-ui.js';
import {createTourService} from '../src/modules/tour.js';
it('TOUR-45 상위 변경·유형 변경·초기화가 하위 선택을 지운다',()=>{
 const form=document.createElement('form');form.innerHTML='<select name="type"><option value=""></option><option value="28">레포츠</option></select>';
 const control=mountClassification(form,{mode:'live'});
 const choose=(name,value)=>{const select=form.querySelector(`[name="${name}"]`);select.value=value;select.dispatchEvent(new Event('change'));return select;};
 choose('large','AC');choose('middle','AC05');choose('small','AC050100');
 expect(control.value()).toEqual({large:'AC',middle:'AC05',small:'AC050100'});
 choose('large','NA');expect(control.value()).toEqual({large:'NA',middle:'',small:''});
 choose('type','28');expect(control.value().large).toBe('');
 expect(form.querySelector('[name="large"]').textContent).not.toContain('음식');
 choose('large','AC');control.reset();expect(control.value().large).toBe('');expect(form.querySelector('[name="middle"]').disabled).toBe(true);
});
it('TOUR-45 샘플에서 분류를 추정하지 않는다',()=>{
 const form=document.createElement('form');form.innerHTML='<select name="type"></select>';mountClassification(form,{mode:'sample'});
 expect(form.textContent).toContain('샘플에는 세부 분류 정보가 없습니다');
 expect([...form.querySelectorAll('details select')].every(s=>s.disabled)).toBe(true);
});
it('TOUR-45 서비스가 분류와 취소 신호를 전달한다',async()=>{
 const catalog={list:vi.fn(async()=>[])},signal=new AbortController().signal;
 const classification={large:'AC'};const service=createTourService({catalog,search:{find:async p=>p},logger:{record:()=>{}}});
 await service.find({classification,signal});expect(catalog.list).toHaveBeenCalledWith(expect.objectContaining({classification,signal}));
});
