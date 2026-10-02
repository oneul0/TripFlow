import {normalize} from './catalog.js';
import {tourFilters} from './tour-codes.js';
import {insideBounds} from '../modules/regions.js';
export function validViewport(b){return b&&['west','east','south','north'].every(k=>Number.isFinite(b[k]))&&b.west>=-180&&b.east<=180&&b.south>=-90&&b.north<=90&&b.west<b.east&&b.south<b.north;}
export function createViewportCatalog({key,fetcher=fetch}){
 return async({bounds,signal,...filters})=>{
  if(!validViewport(bounds))throw Error('지도 범위를 확인해주세요.');
  const {west,east,south,north}=bounds;
  // Each cell's bounding circle is <20km even at the equator.
  const cols=Math.ceil((east-west)/.24),rows=Math.ceil((north-south)/.24);
  if(cols*rows>16)return {places:[],partial:true,zoomRequired:true};
  const params=tourFilters(filters),places=new Map();let calls=0;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const dx=(east-west)/cols,dy=(north-south)/rows;
   const longitude=west+(x+.5)*dx,latitude=south+(y+.5)*dy;
   const radius=Math.min(20000,Math.max(1,Math.ceil(Math.hypot(dx,dy)*111320/2)+10));
   let received=0;
   for(let page=1;;page++){
    signal?.throwIfAborted();if(calls++>=40)return {places:[...places.values()],partial:true,zoomRequired:false};
    const url=new URL('https://apis.data.go.kr/B551011/KorService2/locationBasedList2');
    url.search=new URLSearchParams({serviceKey:key,MobileOS:'ETC',MobileApp:'EnjoyTrip',_type:'json',numOfRows:'100',pageNo:String(page),arrange:'A',mapX:String(longitude),mapY:String(latitude),radius:String(radius),...params});
    const response=await fetcher(url.href,{signal});if(!response.ok)throw Error('지도 관광정보 조회에 실패했습니다.');
    const data=(await response.json()).response,total=Number(data?.body?.totalCount);
    if(!['0000','00'].includes(String(data?.header?.resultCode))||!Number.isInteger(total)||total<0)throw Error('지도 관광정보 응답이 올바르지 않습니다.');
    const item=data.body.items?.item??[],items=Array.isArray(item)?item:[item];
    if(!items.length&&received<total)throw Error('지도 관광정보 페이지가 누락되었습니다.');
    for(const row of items){const place=normalize(row);if(insideBounds(place,bounds))places.set(place.contentId,place);}
    received+=items.length;if(received>=total)break;
   }
  }
  return {places:[...places.values()],partial:false,zoomRequired:false};
 };
}
