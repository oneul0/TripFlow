export function resolveRuntime(env={}) {
 if(env.VITE_DATA_MODE!=='live') return {mode:'sample',key:''};
 return {mode:'live',key:''};
}
