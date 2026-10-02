/** @param {{catalog: import('../contracts.js').Catalog, search: import('../contracts.js').Search, logger: import('../contracts.js').Logger}} dependencies */
export function createTourService({catalog,search,logger}) {
  return {findViewport:catalog.viewport?async(filters)=>{const result=await catalog.viewport(filters);return {...result,places:await search.find(result.places,{query:filters.query||'',signal:filters.signal})};}:undefined,async findPage(filters={}) {
    if(!catalog.page){const places=await this.find(filters);return {places,totalCount:places.length,pageNo:1,partial:false,mode:'sample'};}
    const page=await catalog.page(filters);
    const places=await search.find(page.places,{query:filters.query||'',signal:filters.signal});
    logger.record('search.completed',{count:places.length});return {...page,places};
  },async find({area='',type='',query='',classification,signal}={}) {
    const places=await catalog.list({area,type,classification,signal});
    const result=await search.find(places,{query,signal});
    logger.record('search.completed',{count:result.length});
    return result;
  }};
}
