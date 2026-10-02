import classifications from './data/tour-classification.json';

export function mountClassification(form,{mode}){
 const details=document.createElement('details');details.className='classification-filter';
 const summary=document.createElement('summary');summary.textContent='세부 분류 (선택)';details.append(summary);
 const fields=document.createElement('div');fields.className='classification-fields';details.append(fields);
 const selects={};
 for(const [name,label] of [['large','대분류'],['middle','중분류'],['small','소분류']]){
  const wrapper=document.createElement('div'),caption=document.createElement('label'),select=document.createElement('select');
  caption.htmlFor=`classification-${name}`;caption.textContent=label;
  select.id=caption.htmlFor;select.name=name;select.className='form-select';selects[name]=select;wrapper.append(caption,select);fields.append(wrapper);
 }
 if(mode!=='live'){const note=document.createElement('p');note.textContent='샘플에는 세부 분류 정보가 없습니다. 공공데이터 연동 모드에서 사용할 수 있습니다.';details.append(note);}
 form.append(details);
 const rows=()=>classifications.filter(c=>!form.elements.type.value||c.contentTypeId===form.elements.type.value);
 function fill(name,items,labelKey,enabled){
  const select=selects[name];select.replaceChildren(new Option('전체',''));
  for(const [code,label] of new Map(items.map(c=>[c[name],c[labelKey]])))select.add(new Option(label,code));
  select.disabled=mode!=='live'||!enabled;
 }
 function reset(){fill('large',rows(),'largeName',true);fill('middle',[],'middleName',false);fill('small',[],'name',false);}
 selects.large.addEventListener('change',()=>{fill('middle',rows().filter(c=>c.large===selects.large.value),'middleName',!!selects.large.value);fill('small',[],'name',false);});
 selects.middle.addEventListener('change',()=>fill('small',rows().filter(c=>c.large===selects.large.value&&c.middle===selects.middle.value),'name',!!selects.middle.value));
 form.elements.type.addEventListener('change',reset);reset();
 return {value:()=>Object.fromEntries(Object.entries(selects).map(([name,select])=>[name,select.value])),reset};
}
