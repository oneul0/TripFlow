export function createServerCatalog({fetcher=fetch}={}){
 async function request(operation,{area='',type='',classification={},pageNo=1,bounds,signal}={}){
  if(!area)throw Error('실시간 관광정보를 조회할 지역을 선택해주세요.');
  const params=new URLSearchParams({area,type,...classification,pageNo:String(pageNo),...(bounds||{})});
  let response;try{response=await fetcher(`/api/tour/${operation}?${params}`,{signal});}catch(error){if(error.name==='AbortError')throw error;throw Error('관광정보 연결에 실패했습니다. 다시 시도해주세요.');}
  if(!response.ok){if(response.status===503)throw Error('서버에 관광 API 키 설정이 필요합니다.');throw Error('관광정보를 불러오지 못했습니다. 지역과 유형을 좁히거나 잠시 후 다시 시도해주세요.');}
  const result=await response.json();return result.data;
 }
 return {viewport:filters=>request('viewport',filters),page:filters=>request('page',filters),list:filters=>request('list',filters),preview:filters=>request('preview',filters)};
}
