export const validPosition=p=>Number.isFinite(p.longitude)&&Number.isFinite(p.latitude)&&Math.abs(p.longitude)<=180&&Math.abs(p.latitude)<=90;
export const polygonsOf=geometry=>geometry.type==='MultiPolygon'?geometry.coordinates:[geometry.coordinates];
function inRing([x,y],ring){
 let inside=false;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const [a,b]=ring[j],[c,d]=ring[i];
  const cross=(x-a)*(d-b)-(y-b)*(c-a);
  if(Math.abs(cross)<1e-10&&x>=Math.min(a,c)&&x<=Math.max(a,c)&&y>=Math.min(b,d)&&y<=Math.max(b,d)) return true;
  if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a) inside=!inside;
 }
 return inside;
}
export function pointInGeometry(point,geometry){
 return polygonsOf(geometry).some(rings=>inRing(point,rings[0])&&!rings.slice(1).some(ring=>inRing(point,ring)));
}
export const densityIntensity=(count,max)=>max>0?Math.min(1,Math.log1p(Math.max(0,count))/Math.log1p(max)):0;
export function boundsOf(regions){
 const points=regions.flatMap(r=>polygonsOf(r.geometry).flat(2));
 return {west:Math.min(...points.map(p=>p[0])),east:Math.max(...points.map(p=>p[0])),south:Math.min(...points.map(p=>p[1])),north:Math.max(...points.map(p=>p[1]))};
}
export function insideBounds(place,bounds){return validPosition(place)&&place.longitude>=bounds.west&&place.longitude<=bounds.east&&place.latitude>=bounds.south&&place.latitude<=bounds.north;}
export function createRegionExplorer(boundaries){
 return {analyze(input){
  const places=[...new Map(input.map(p=>[p.contentId,p])).values()];
  const assignments=new Map();
  for(const place of places){
   if(!validPosition(place)) continue;
   const region=boundaries.find(r=>pointInGeometry([place.longitude,place.latitude],r.geometry));
   if(region) assignments.set(place.contentId,region.id);
  }
  const regions=boundaries.map(r=>({...r,places:places.filter(p=>assignments.get(p.contentId)===r.id)}));
  const max=Math.max(0,...regions.map(r=>r.places.length));
  for(const region of regions){region.count=region.places.length;region.intensity=densityIntensity(region.count,max);}
  return {places,regions,unmapped:places.length-assignments.size,select:id=>id?places.filter(p=>assignments.get(p.contentId)===id):places,regionOf:id=>assignments.get(id)};
 }};
}
