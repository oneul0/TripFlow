import {World,Body,Sphere,Plane,Vec3} from 'cannon-es';
export const THROW_ORIGIN=Object.freeze({x:400,y:410,z:600});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Board coordinates are centimetres. z is distance in front of the upright map.
export function simulateThrow({vx,vy,spin,origin=THROW_ORIGIN,rotation=0}){
 if(![vx,vy,spin,origin.x,origin.y,origin.z].every(Number.isFinite)||origin.z<=0)throw new Error('Invalid throw');
 spin=clamp(spin,-6,6);const duration=.8,targetX=400+clamp(vx,-240,240),targetY=550+clamp(vy,-380,-80)*1.25;
 const world=new World({gravity:new Vec3(0,1.8,0)}),board=new Body({mass:0,shape:new Plane()});world.addBody(board);
 const ball=new Body({mass:1,shape:new Sphere(.22),position:new Vec3(origin.x/100,origin.y/100,origin.z/100+.22),velocity:new Vec3((targetX-origin.x)/100/duration,(targetY-origin.y)/100/duration-.5*1.8*duration,-origin.z/100/duration),angularVelocity:new Vec3(spin*.4,spin*.2,spin*5),linearDamping:0,angularDamping:.42});
 ball.quaternion.setFromAxisAngle(new Vec3(-.3,.8,-.5).unit(),rotation*Math.PI/180);world.addBody(ball);let landed=false;ball.addEventListener('collide',event=>{if(event.body===board)landed=true;});
 const snapshot=t=>({x:ball.position.x*100,y:ball.position.y*100,z:Math.max(0,(ball.position.z-.22)*100),t,quaternion:ball.quaternion.toArray()});const points=[snapshot(0)];
 for(let i=1;i<200;i++){ball.applyForce(new Vec3(ball.angularVelocity.z/5*.5,0,0));world.step(1/120);const point=snapshot(i/120);points.push(point);if(landed){point.z=0;break;}}
 return points;
}

// Use the same physics engine for held-ball rotational damping.
export function createSpinInertia(){
 const world=new World({gravity:new Vec3(0,0,0)}),body=new Body({mass:1,shape:new Sphere(1),angularDamping:.85});world.addBody(body);let angle=0;
 return {get angle(){return angle;},get spin(){return body.angularVelocity.z/Math.PI;},
 kick(delta,spin){angle+=delta;body.angularVelocity.set(0,0,clamp(spin,-6,6)*Math.PI);body.wakeUp();},
 step(dt){if(!Number.isFinite(dt)||dt<=0)return;const before=body.angularVelocity.z;world.step(Math.min(dt,.1));angle+=(before+body.angularVelocity.z)*.5*Math.min(dt,.1)*180/Math.PI;if(Math.abs(body.angularVelocity.z)<.01)body.angularVelocity.setZero();},
 reset(){angle=0;body.angularVelocity.setZero();body.quaternion.set(0,0,0,1);}};
}
