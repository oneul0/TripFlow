/**
 * @typedef {{contentId:string,title:string,address:string,areaCode:string,sigunguCode?:string,legalRegionCode?:string,legalDistrictCode?:string,classification?:{large:string,middle:string,small:string},contentTypeId:string,imageUrl?:string,latitude?:number,longitude?:number}} Place
 * @typedef {{list:(filters:{area?:string,type?:string,classification?:{large?:string,middle?:string,small?:string},signal?:AbortSignal})=>Promise<Place[]>,preview:(filters:{area:string,signal?:AbortSignal})=>Promise<{places:Place[],totalCount:number,partial:boolean,mode:'sample'|'live'}>}} Catalog
 * @typedef {{find:(places:Place[],options:{query?:string,signal?:AbortSignal})=>Promise<Place[]>}} Search
 * @typedef {{record:(event:string,fields?:{count?:number,mode?:string})=>void}} Logger
 * @typedef {{status:'available'|'unavailable',items:{contentId:string,reason:string}[]}} Recommendation
 * @typedef {{recommend:(input:{places:Place[],preferences?:string,signal?:AbortSignal})=>Promise<Recommendation>}} Assistant
 * @typedef {{id:string,name:string,areaCode:string,geometry:{type:'Polygon'|'MultiPolygon',coordinates:Array}}} Region
 * @typedef {{list:()=>Region[],source:{year:number,name:string,url:string,license:string}}} BoundaryCatalog
 * @typedef {{update:(state:{regions:Region[],selectedRegion:string|null,selectedPlace:string|null})=>void,focusRegion:(id:string|null)=>void,focusPlace:(place:Place)=>void,getBounds:()=>({west:number,east:number,south:number,north:number}|null),destroy:()=>void}} MapView
 */
export {};
