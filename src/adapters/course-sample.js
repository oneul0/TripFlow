import {samplePlaces} from '../data/places.js';
// Explicit synthetic facts: never interpreted as actual prices or routing results.
export const coursePlaces=samplePlaces.filter(p=>p.contentTypeId!=='32').map(p=>({id:p.contentId,title:p.title,area:p.areaCode,category:p.contentTypeId,address:p.address,tags:[p.contentTypeId==='39'?'food':p.contentTypeId==='14'?'culture':'nature'],stay:60,cost:10000}));
export const demoAuthors={'demo-a':'여행자 가온 · 합성','demo-b':'여행자 나래 · 합성','demo-guide':'샘플 코스 편집자'};
