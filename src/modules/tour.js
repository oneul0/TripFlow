/** @param {{catalog: import('../contracts.js').Catalog, search: import('../contracts.js').Search, logger: import('../contracts.js').Logger}} dependencies */
export function createTourService({catalog,search,logger}) {
  return {async find({area='',type='',query='',signal}={}) {
    const places=await catalog.list({area,type,signal});
    const result=await search.find(places,{query,signal});
    logger.record('search.completed',{count:result.length});
    return result;
  }};
}
