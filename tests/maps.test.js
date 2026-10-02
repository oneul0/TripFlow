import {it,expect,vi} from 'vitest';
import {loadKakaoSdk,createKakaoMap} from '../src/maps/kakao-map.js';
import {paintDensity} from '../src/maps/density-canvas.js';
it('키 누락·SDK 오류는 비밀이 없는 안내이며 실패 후 재시도 가능하다',async()=>{
 await expect(loadKakaoSdk({key:'',document})).rejects.toThrow(/키/);
 const first=loadKakaoSdk({key:'synthetic-public-key',document,timeoutMs:20});
 document.querySelector('[data-kakao-sdk]').dispatchEvent(new Event('error'));
 await expect(first).rejects.toThrow('지도를 불러오지 못했습니다. 키와 도메인 설정을 확인해주세요.');
 expect(document.querySelector('[data-kakao-sdk]')).toBeNull();
 const retry=loadKakaoSdk({key:'synthetic-public-key',document,timeoutMs:1});await expect(retry).rejects.toThrow(/지도를/);
});
it('SDK 준비 후 데이터가 도착하기 전에도 지도 생성·정리가 성공한다',async()=>{
 const map={setBounds:vi.fn(),getProjection:vi.fn(),relayout:vi.fn()};
 const clusterer={clear:vi.fn(),addMarkers:vi.fn()};
 const overlay={setMap:vi.fn()};
 const maps={Map:class{constructor(){return map;}},LatLng:class{},LatLngBounds:class{},MarkerClusterer:class{constructor(){return clusterer;}},CustomOverlay:class{constructor(){return overlay;}},Polygon:class{setOptions(){}setMap(){}},event:{addListener:vi.fn(),removeListener:vi.fn()}};
 const region={id:'r',geometry:{type:'Polygon',coordinates:[[[126,37],[127,37],[127,38],[126,37]]]}};
 const container=document.createElement('div');Object.defineProperties(container,{clientWidth:{value:800},clientHeight:{value:600}});
 const view=await createKakaoMap(container,{maps,regions:[region],onRegion:vi.fn(),onPlace:vi.fn()});
 expect(map.setBounds).toHaveBeenCalled();expect(clusterer.addMarkers).toHaveBeenCalledWith([]);
 view.destroy();expect(container.children).toHaveLength(0);expect(maps.event.removeListener).toHaveBeenCalled();
});
it('그라디언트는 위경도를 투영하고 구역 경계에 마스킹한다',()=>{
 const ctx=Object.fromEntries(['clearRect','save','beginPath','moveTo','lineTo','closePath','clip','fillRect','restore'].map(name=>[name,vi.fn()]));ctx.createRadialGradient=vi.fn(()=>({addColorStop:vi.fn()}));
 const project=vi.fn(([x,y])=>[x*2,y*3]);
 paintDensity(ctx,[{count:1,geometry:{type:'Polygon',coordinates:[[[1,2],[3,2],[3,4],[1,2]]]},places:[{longitude:2,latitude:3}]}],project,{width:100,height:100});
 expect(ctx.clip).toHaveBeenCalledWith('evenodd');expect(project).toHaveBeenCalledWith([2,3]);expect(ctx.createRadialGradient).toHaveBeenCalledWith(4,9,0,4,9,52);expect(ctx.restore).toHaveBeenCalled();
});

it('MAP-INIT-01 숨겨진 지도는 표시될 때 맞추고 재배치 시 중심을 보존한다',async()=>{
 let resize,width=0,height=0;const center={lat:37.5665,lng:126.978};
 vi.stubGlobal('ResizeObserver',class{constructor(fn){resize=fn;}observe(){}disconnect(){}});
 const map={setBounds:vi.fn(),getCenter:()=>center,setCenter:vi.fn(),relayout:vi.fn()};
 const maps={Map:class{constructor(){return map;}},LatLng:class{},LatLngBounds:class{},MarkerClusterer:class{clear(){}addMarkers(){}},CustomOverlay:class{setMap(){}},Polygon:class{setOptions(){}setMap(){}},event:{addListener(){},removeListener(){}}};
 const container=document.createElement('div');Object.defineProperties(container,{clientWidth:{get:()=>width},clientHeight:{get:()=>height}});
 const region={id:'r',geometry:{type:'Polygon',coordinates:[[[126,37],[127,37],[127,38],[126,37]]]}};
 let view;try{
 view=await createKakaoMap(container,{maps,regions:[region]});expect(map.setBounds).not.toHaveBeenCalled();
 width=800;height=600;resize();expect(map.setBounds).toHaveBeenCalledTimes(1);
 width=900;resize();expect(map.setCenter).toHaveBeenCalledWith(center);expect(map.setBounds).toHaveBeenCalledTimes(1);
 width=0;resize();view.focusRegion('r');expect(map.setBounds).toHaveBeenCalledTimes(1);
 width=800;resize();expect(map.setBounds).toHaveBeenCalledTimes(2);
 }finally{view?.destroy();vi.unstubAllGlobals();}
});
