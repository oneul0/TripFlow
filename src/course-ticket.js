import {validWeather,weatherSymbol} from './modules/course-weather.js';
import {blockTotals} from './modules/course-blocks.js';
import {types} from './adapters/catalog.js';
const xml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const lines=(value,size)=>Array.from(String(value||'이름 없음')).reduce((a,c,i)=>{if(i%size===0)a.push('');a[a.length-1]+=c;return a;},[]);
export function ticketSVG(course){
 const ink='#222037',muted='#726e80',purple='#6235da',paper='#fffdf6';
 const text=[],shapes=[];
 const label=(value,x,y,size=18,color=ink,weight=600)=>text.push('<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" font-weight="'+weight+'">'+xml(value)+'</text>');
 let y=143;
 label('YOUR NEXT DEPARTURE',40,y,13,muted);y+=40;
 for(const title of lines(course.title,19)){label(title,40,y,28);y+=38;}
 label('여행 코스 · 방문 순서'+(course.input?.tripDate?' · '+course.input.tripDate:''),40,y+12,16,muted);y+=50;
 shapes.push('<path d="M40 '+y+'H554" stroke="#ded9e7"/>');y+=40;
 course.stops.forEach((p,i)=>{
  shapes.push('<rect x="40" y="'+(y-22)+'" width="40" height="32" rx="5" fill="#eee7fc"/>');
  label(String(i+1).padStart(2,'0'),49,y,18,purple);
  label((types[p.category]||'유형 미제공')+(p.source==='tourapi'?'':' · 샘플'),96,y-3,14,muted);
  y+=29;for(const name of lines(p.title,22)){label(name,96,y,20);y+=29;}y+=26;
 });
 const totals=blockTotals(course.stops),time=totals.minutes||totals.timeComplete?totals.minutes+'분'+(totals.timeComplete?'':' · 일부 미확인'):'미확인',cost=totals.cost||totals.costComplete?totals.cost.toLocaleString()+'원'+(totals.costComplete?'':' · 일부 미확인'):'미확인';
 const w=course.input?.weather;
 if(course.input?.tripDate){
  shapes.push('<path d="M40 '+y+'H554" stroke="#ded9e7"/>');y+=32;label('SKY ALONG YOUR WAY',40,y,14,purple);y+=28;
  if(validWeather(w)&&w.date===course.input.tripDate){
   for(const row of lines((w.mode==='sample'?'샘플 예보':'기상청')+' · 첫 방문지'+(w.nearby?' 주변':'')+' 기준',32)){label(row,40,y,14,muted);y+=22;}
   for(const row of lines(w.stationName,30)){label(row,40,y,14,muted);y+=22;}y+=8;
   if(w.status==='ready'){
    w.slots.forEach((slot,i)=>{const x=40+(i%4)*130,top=y+Math.floor(i/4)*145,icon=weatherSymbol(slot.sky);shapes.push('<rect x="'+x+'" y="'+top+'" width="122" height="135" rx="12" fill="#eef3f8"/>');label(slot.time,x+12,top+22,14,muted);text.push('<text x="'+(x+12)+'" y="'+(top+65)+'" font-size="32" font-family="Segoe UI Emoji, Apple Color Emoji, sans-serif">'+icon.emoji+'</text>');label(slot.temperature===null?'미확인':slot.temperature+'°',x+66,top+61,18);label(icon.label,x+12,top+90,13);label('강수 '+(slot.pop===null?'미확인':slot.pop+'%'),x+12,top+116,12,muted);});
    y+=Math.ceil(w.slots.length/4)*145;
   }else{label(w.status==='unavailable'?'예보 제공 범위 밖 · 여행일에 가까워지면 확인':'날씨 미확인 · 제공된 예보가 없습니다',40,y+18,15,muted);y+=48;}
   label('3시간 간격 · 한국시간 · 저장 시 조회한 예보',40,y+12,13,muted);y+=34;
   label('조회 '+new Date(w.fetchedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}),40,y,13,muted);y+=30;
  }else{label('날씨 미확인 · 연결 가능한 예보가 없습니다',40,y,15,muted);y+=34;}
 }
 const height=Math.max(590,y+110);
 shapes.push('<path d="M40 '+(height-104)+'H554" stroke="#ded9e7"/>');
 label('입력한 추정치 · 첫 장소까지와 귀가 이동 제외',40,height-70,14,muted);
 label('예약·입장권이 아닌 여행 코스 기록입니다.',40,height-42,14,muted);
 label('TRAVEL PASS',626,144,15,purple);label('여행 요약',626,177,22);
 label('STOPS / 방문지',626,224,13,muted);label(String(course.stops.length).padStart(2,'0'),624,282,54);
 label('EST. TIME',626,326,13,muted);let stubY=355;for(const row of lines(time,10)){label(row,626,stubY,17);stubY+=25;}
 label('EST. COST / 1인',626,stubY+22,13,muted);stubY+=51;for(const row of lines(cost,10)){label(row,626,stubY,17);stubY+=25;}
 label('GO. COLLECT.',626,height-66,14,purple);label('MAKE MEMORIES.',626,height-43,14,purple);
 return {width:800,height,svg:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="'+height+'" viewBox="0 0 800 '+height+'" role="img" aria-label="여행 코스 탑승권"><defs><mask id="ticket-cut"><rect width="800" height="'+height+'" rx="18" fill="white"/><circle cx="594" cy="0" r="16" fill="black"/><circle cx="594" cy="'+height+'" r="16" fill="black"/></mask></defs><g mask="url(#ticket-cut)"><rect width="800" height="'+height+'" fill="'+paper+'"/><rect x="594" width="206" height="'+height+'" fill="#f0eaf9"/><path d="M0 0H800V92H0Z" fill="'+purple+'"/><path d="M594 16V'+(height-16)+'" stroke="#b5a6d0" stroke-width="2" stroke-dasharray="6 8"/><g font-family="Malgun Gothic, sans-serif"><text x="40" y="57" fill="white" font-size="31" font-weight="800">TripFlow</text><text x="264" y="55" fill="#e7dcff" font-size="13" letter-spacing="2">BOARDING PASS</text><path d="M651 45l13 4 29-18 7 3-19 21 22 7-3 5-27-3-12 9-5-2 5-13-13-9Z" fill="white"/>'+shapes.join('')+text.join('')+'</g></g></svg>'};
}
export async function downloadTicket(course){
 const {svg,width,height}=ticketSVG(course),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 try{
  const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('티켓 이미지를 만들지 못했습니다. 다시 시도해주세요.'));image.src=url;});
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서는 이미지 저장을 사용할 수 없습니다.');ctx.drawImage(image,0,0);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('티켓 저장에 실패했습니다. 다시 시도해주세요.');
  const output=URL.createObjectURL(blob),a=document.createElement('a');a.href=output;a.download='tripflow-course-ticket.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(output),2000);
 }finally{URL.revokeObjectURL(url);}
}
