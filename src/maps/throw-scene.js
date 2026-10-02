import {PerspectiveCamera,Vector3,Vector2,Plane,Raycaster,Scene,Group,Mesh,SphereGeometry,TorusGeometry,MeshLambertMaterial,AmbientLight,DirectionalLight,Quaternion,WebGLRenderer} from 'three';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';

export function createThrowCamera(){
 const camera=new PerspectiveCamera(42,800/600,1,3000);camera.position.set(0,620,730);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 const ray=new Raycaster();
 return {camera,
  project({x,y,z=0}){const world=new Vector3(x-400,z,y-300),depth=world.clone().applyMatrix4(camera.matrixWorldInverse).z,p=world.project(camera);return {x:(p.x+1)*400,y:(1-p.y)*300,scale:780/-depth};},
  ground({x,y},height=0){ray.setFromCamera(new Vector2(x/400-1,1-y/300),camera);const hit=ray.ray.intersectPlane(new Plane(new Vector3(0,1,0),-height),new Vector3());return hit?{x:hit.x+400,y:hit.z+300,z:0}:null;}
 };
}
export function createBallScene(container,view){
 const scene=new Scene();let renderer;
 try{if(!globalThis.WebGL2RenderingContext)throw Error();renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(2,globalThis.devicePixelRatio||1));}catch{renderer=new SVGRenderer();renderer.setPrecision(2);}
 renderer.setSize(800,600,false);renderer.domElement.classList.add('random-ball-scene');renderer.domElement.setAttribute('aria-hidden','true');container.append(renderer.domElement);
 scene.add(new AmbientLight(0xffffff,.9));const light=new DirectionalLight(0xffffff,1.3);light.position.set(-150,300,350);scene.add(light);
 const group=new Group();scene.add(group);const resources=[];
 function mesh(geometry,color){const material=new MeshLambertMaterial({color}),object=new Mesh(geometry,material);resources.push(geometry,material);group.add(object);return object;}
 mesh(new SphereGeometry(25,24,16,0,Math.PI*2,0,Math.PI/2),0xf8b54e);
 mesh(new SphereGeometry(25,24,16,0,Math.PI*2,Math.PI/2,Math.PI/2),0xf4eed4);
 const belt=mesh(new TorusGeometry(25,1.8,6,32),0x304d45);belt.rotation.x=Math.PI/2;
 const mark=mesh(new SphereGeometry(5,10,8),0x234c40);mark.position.set(12,12,18);
 const mark2=mesh(new SphereGeometry(3,8,6),0xfff9dd);mark2.position.set(-12,14,17);
 const q=new Quaternion();
 return {draw(point,angle=0){group.scale.setScalar(container.clientWidth>0&&container.clientWidth<480?1.4:1);group.position.set(point.x-400,point.z+25,point.y-300);if(point.quaternion){const [x,y,z,w]=point.quaternion;group.quaternion.set(x,z,-y,w);}else{q.setFromAxisAngle(new Vector3(.3,.8,.5).normalize(),angle*Math.PI/180);group.quaternion.copy(q);}renderer.render(scene,view.camera);renderer.domElement.style.background='transparent';},destroy(){resources.forEach(r=>r.dispose());renderer.dispose?.();renderer.domElement.remove();}};
}
