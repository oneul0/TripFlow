import provinces from '../data/korea-provinces-2013.geo.json';
import cities from '../data/korea-municipalities-2013.geo.json';
import towns from '../data/korea-submunicipalities-2013.geo.json';
const areaCodes={'11':'1','21':'6','22':'4','23':'2','24':'5','25':'3','26':'7','29':'8','31':'31','32':'32','33':'33','34':'34','35':'35','36':'36','37':'37','38':'38','39':'39'};
const names=new Map([...provinces.features,...cities.features].map(f=>[String(f.properties.code),f.properties.name]));
export const nationalRegions=[['province',provinces],['city',cities],['town',towns]].flatMap(([level,data])=>data.features.map(f=>{
 const id=String(f.properties.code),provinceId=id.slice(0,2),cityId=level==='town'?id.slice(0,5):level==='city'?id:null;
 return {id,name:f.properties.name,level,provinceId,cityId,parentId:level==='town'?cityId:level==='city'?provinceId:null,path:[level!=='province'?names.get(provinceId):null,level==='town'?names.get(cityId):null,f.properties.name].filter(Boolean).join(' '),areaCode:areaCodes[provinceId],geometry:f.geometry,boundaryVersion:'KOSTAT-2013'};
}));
export const regionsAt=(level,parent='')=>nationalRegions.filter(r=>r.level===level&&(!parent||r.id.startsWith(parent)));
