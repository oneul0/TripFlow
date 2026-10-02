/** @type {import('../contracts.js').Search} */
export const localSearch={async find(places,{query=''}) {
  const tokens=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return places.filter(p=>tokens.every(token=>`${p.title} ${p.address}`.toLocaleLowerCase().includes(token)));
}};
/** @type {import('../contracts.js').Assistant} */
export const unavailableAssistant={async recommend(){return {status:'unavailable',items:[]};}};
export function createLogger(sink=()=>{}) {
  return {record(event,fields={}) {
    if(!['search.completed','app.started'].includes(event)) return;
    const safe={};
    if(Number.isInteger(fields.count)&&fields.count>=0) safe.count=fields.count;
    if(['sample','live'].includes(fields.mode)) safe.mode=fields.mode;
    try {sink(event,safe);} catch { /* Observability must not interrupt user actions. */ }
  }};
}
