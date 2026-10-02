export function resolveRuntime(env={}) {
 if(env.VITE_DATA_MODE!=='live') return {mode:'sample',key:''};
 if(!env.VITE_TOUR_API_KEY?.trim()) throw Error('실연동에는 관광 API 키 설정이 필요합니다.');
 return {mode:'live',key:env.VITE_TOUR_API_KEY};
}
