import {boundsOf,polygonsOf} from '../modules/regions.js';
const ns='http://www.w3.org/2000/svg';
const node=(name,attrs={})=>{const el=document.createElementNS(ns,name);for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));return el;};
const mercator=lat=>Math.log(Math.tan(Math.PI/4+lat*Math.PI/360));
export function createSvgMap(container,{regions,onRegion,onPlace}){
 const svg=node('svg',{viewBox:'0 0 800 540',role:'img','aria-label':'선택 지역 경계와 조회된 관광정보 지도'});
 container.replaceChildren(svg);
 let frame=boundsOf(regions),state={regions,selectedRegion:null,selectedPlace:null};
 function project([lon,lat]){
  const dx=frame.east-frame.west,dy=(mercator(frame.north)-mercator(frame.south))*180/Math.PI;
  const scale=Math.min(720/dx,460/dy);
  return [400+(lon-(frame.east+frame.west)/2)*scale,270-((mercator(lat)-(mercator(frame.north)+mercator(frame.south))/2)*180/Math.PI)*scale];
 }
 const pathOf=geometry=>polygonsOf(geometry).map(rings=>rings.map(ring=>ring.map((coord,i)=>`${i?'L':'M'}${project(coord).join(',')}`).join(' ')+' Z').join(' ')).join(' ');
 function render(){
  svg.replaceChildren();
  const defs=node('defs'),gradient=node('radialGradient',{id:'sample-glow'});
  gradient.append(node('stop',{offset:'0%', 'stop-color':'#fff3a6','stop-opacity':1}),node('stop',{offset:'35%','stop-color':'#ffc954','stop-opacity':.8}),node('stop',{offset:'100%','stop-color':'#fc8245','stop-opacity':0}));defs.append(gradient);svg.append(defs);
  for(const region of state.regions){
   const selected=region.id===state.selectedRegion;
   const path=pathOf(region.geometry),shape=node('path',{d:path,fill:region.count?`hsl(${270-region.intensity*45} 48% ${20+region.intensity*24}%)`:'#24263e',stroke:selected?'#ffdf76':'#666582','stroke-width':selected?3.5:1.2,'fill-rule':'evenodd',class:'district-shape','data-region':region.id});
   shape.addEventListener('click',()=>onRegion(region.id));svg.append(shape);
   const clip=node('clipPath',{id:`clip-${region.id}`});clip.append(node('path',{d:path,'clip-rule':'evenodd'}));defs.append(clip);
   const glow=node('g',{'clip-path':`url(#clip-${region.id})`,opacity:.6,'pointer-events':'none'});
   for(const place of region.places||[]){const [cx,cy]=project([place.longitude,place.latitude]);glow.append(node('circle',{cx,cy,r:48,fill:'url(#sample-glow)'}));}
   svg.append(glow);
  }
  for(const region of state.regions){
   for(const place of region.places||[]){
    const [cx,cy]=project([place.longitude,place.latitude]);const marker=node('circle',{cx,cy,r:place.contentId===state.selectedPlace?8:4,fill:place.contentId===state.selectedPlace?'#ffdf76':'#fff',stroke:'#8f63ee','stroke-width':2,class:'map-point','data-place':place.contentId});
    marker.append(Object.assign(node('title'),{textContent:place.title}));marker.addEventListener('click',()=>onPlace(place.contentId));svg.append(marker);
   }
  }
 }
 render();
 return {update(next){state=next;render();},focusRegion(id){frame=id?boundsOf(regions.filter(r=>r.id===id)):boundsOf(regions);render();},focusPlace(){},getBounds:()=>null,destroy(){container.replaceChildren();}};
}
