import geojson from '../data/seoul-2013.geo.json';
// Boundary codes belong to KOSTAT 2013, not to TourAPI. Assignment uses geometry.
export const seoulBoundaryCatalog={list(){return geojson.features.map(f=>({id:String(f.properties.code),name:f.properties.name,areaCode:'1',geometry:f.geometry}));},source:{year:2013,name:'KOSTAT · southkorea/seoul-maps',url:'https://github.com/southkorea/seoul-maps',license:'Apache-2.0'}};
