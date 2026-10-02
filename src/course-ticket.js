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
 label('여행 코스 · 방문 순서',40,y+12,16,muted);y+=50;
 shapes.push('<path d="M40 '+y+'H554" stroke="#ded9e7"/>');y+=40;
 course.stops.forEach((p,i)=>{
  shapes.push('<rect x="40" y="'+(y-22)+'" width="40" height="32" rx="5" fill="#eee7fc"/>');
  label(String(i+1).padStart(2,'0'),49,y,18,purple);
  label((types[p.category]||'유형 미제공')+(p.source==='tourapi'?'':' · 샘플'),96,y-3,14,muted);
  y+=29;for(const name of lines(p.title,22)){label(name,96,y,20);y+=29;}y+=26;
 });
 const totals=blockTotals(course.stops),time=totals.minutes||totals.timeComplete?totals.minutes+'분'+(totals.timeComplete?'':' · 일부 미확인'):'미확인',cost=totals.cost||totals.costComplete?totals.cost.toLocaleString()+'원'+(totals.costComplete?'':' · 일부 미확인'):'미확인';
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
