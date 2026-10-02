import {polygonsOf} from '../modules/regions.js';
/** SDK-independent rendering; project receives GeoJSON [longitude,latitude]. */
export function paintDensity(ctx,regions,project,{width,height,radius=52}={}){
 ctx.clearRect(0,0,width,height);
 for(const region of regions){
  if(!region.count)continue;
  ctx.save();ctx.beginPath();
  for(const rings of polygonsOf(region.geometry))for(const ring of rings){ring.forEach((coord,i)=>{const [x,y]=project(coord);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.closePath();}
  ctx.clip('evenodd');
  for(const place of region.places){
   const [x,y]=project([place.longitude,place.latitude]);
   const g=ctx.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,'rgba(255,244,173,.95)');g.addColorStop(.35,'rgba(255,195,70,.7)');g.addColorStop(1,'rgba(255,133,70,0)');
   ctx.fillStyle=g;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  ctx.restore();
 }
}
