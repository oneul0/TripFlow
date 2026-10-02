import {World,Body,Sphere,Plane,Vec3} from 'cannon-es';
export const THROW_ORIGIN=Object.freeze({x:400,y:410,z:600});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Board coordinates are centimetres. z is distance in front of the upright map.
export function simulateThrow({vx,vy,spin,origin=THROW_ORIGIN}){
 if(![vx,vy,spin,origin.x,origin.y,origin.z].every(Number.isFinite)||origin.z<=0)throw new Error('Invalid throw');
 spin=clamp(spin,-6,6);const duration=.8,targetX=400+clamp(vx,-240,240),targetY=550+clamp(vy,-380,-80)*1.25;
 const world=new World({gravity:new Vec3(0,1.8,0)}),board=new Body({mass:0,shape:new Plane()});world.addBody(board);
 const ball=new Body({mass:1,shape:new Sphere(.22),position:new Vec3(origin.x/100,origin.y/100,origin.z/100+.22),velocity:new Vec3((targetX-origin.x)/100/duration,(targetY-origin.y)/100/duration-.5*1.8*duration,-origin.z/100/duration),angularVelocity:new Vec3(spin*.4,spin*.2,spin*5),linearDamping:0,angularDamping:.42});
 world.addBody(ball);let landed=false;ball.addEventListener('collide',event=>{if(event.body===board)landed=true;});
 const snapshot=t=>({x:ball.position.x*100,y:ball.position.y*100,z:Math.max(0,(ball.position.z-.22)*100),t,quaternion:ball.quaternion.toArray()});const points=[snapshot(0)];
 for(let i=1;i<200;i++){ball.applyForce(new Vec3(ball.angularVelocity.z/5*.5,0,0));world.step(1/120);const point=snapshot(i/120);points.push(point);if(landed){point.z=0;break;}}
 return points;
}
