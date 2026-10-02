import {World,Body,Sphere,Plane,Vec3} from 'cannon-es';

// Physics uses metres; the game's plane uses 100 display units per metre.
export function simulateThrow({vx,vy,spin}){
 if(![vx,vy,spin].every(Number.isFinite))throw new Error('Invalid throw');
 const factor=Math.min(1,420/(Math.hypot(vx,vy)||1));spin=Math.max(-6,Math.min(6,spin));
 const world=new World({gravity:new Vec3(0,0,-2.8)});
 const ground=new Body({mass:0,shape:new Plane()});world.addBody(ground);
 const ball=new Body({mass:1,shape:new Sphere(.22),position:new Vec3(4,5.5,.221),velocity:new Vec3(vx*factor/100,vy*factor/100,2.3),angularVelocity:new Vec3(spin*.4,spin*.2,spin*5),linearDamping:0,angularDamping:.42});
 world.addBody(ball);let landed=false;ball.addEventListener('collide',event=>{if(event.body===ground)landed=true;});
 const snapshot=t=>({x:ball.position.x*100,y:ball.position.y*100,z:Math.max(0,(ball.position.z-.22)*100),t,quaternion:ball.quaternion.toArray()});
 const points=[snapshot(0)];points[0].z=0;
 for(let i=1;i<400;i++){
  // Magnus-style game force; cannon integrates both translation and rotation.
  const curve=ball.angularVelocity.z/5*.13;
  ball.applyForce(new Vec3(-ball.velocity.y*curve,ball.velocity.x*curve,0));world.step(1/120);
  const point=snapshot(i/120);if(landed){point.z=0;points.push(point);break;}points.push(point);
 }
 return points;
}
