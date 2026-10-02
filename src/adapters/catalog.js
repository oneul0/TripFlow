import {samplePlaces} from '../data/places.js';
export const areas={'1':'서울','2':'인천','3':'대전','4':'대구','5':'광주','6':'부산','7':'울산','8':'세종','31':'경기','32':'강원','33':'충북','34':'충남','35':'경북','36':'경남','37':'전북','38':'전남','39':'제주'};
export const types={'12':'관광지','14':'문화시설','15':'공연·축제','25':'여행코스','28':'레포츠','32':'숙박','38':'쇼핑','39':'음식점'};
export function createSampleCatalog(){return {async list({area='',type='',signal}={}) {
  signal?.throwIfAborted();return samplePlaces.filter(p=>(!area||p.areaCode===area)&&(!type||p.contentTypeId===type));
}};}
function normalize(row){
  if(!row.contentid||typeof row.title!=='string') throw Error('관광 API 데이터 형식이 올바르지 않습니다.');
  return {contentId:String(row.contentid),title:row.title,address:[row.addr1,row.addr2].filter(Boolean).join(' '),areaCode:String(row.areacode??''),sigunguCode:String(row.sigungucode??''),contentTypeId:String(row.contenttypeid??''),imageUrl:row.firstimage||'',latitude:row.mapy?Number(row.mapy):undefined,longitude:row.mapx?Number(row.mapx):undefined};
}
export function createTourApiCatalog({key,fetcher=fetch,pageSize=100,baseUrl='https://apis.data.go.kr/B551011/KorService2/'}) {
  return {async list({area='',type='',signal}={}) {
    const result=[];
    for(let page=1;page<=10;page++) {
      const url=new URL('areaBasedList2',baseUrl);
      const params={serviceKey:key,MobileOS:'ETC',MobileApp:'EnjoyTrip',_type:'json',numOfRows:String(pageSize),pageNo:String(page),arrange:'A'};
      if(area) params.areaCode=area;if(type) params.contentTypeId=type;
      url.search=new URLSearchParams(params).toString();
      let response;
      try{response=await fetcher(url.toString(),{signal});}catch(error){if(error.name==='AbortError')throw error;throw Error('관광정보 조회에 실패했습니다. 다시 시도해주세요.');}
      if(!response.ok) throw Error('관광정보 조회에 실패했습니다. 다시 시도해주세요.');
      let data;try{data=(await response.json()).response;}catch{throw Error('관광 API 응답을 읽을 수 없습니다. API 키와 서비스 설정을 확인해주세요.');}
      if(!['0000','00'].includes(String(data?.header?.resultCode))) throw Error('관광 API 오류입니다. 키와 호출 한도를 확인해주세요.');
      if(!data.body||!Number.isFinite(Number(data.body.totalCount))) throw Error('관광 API 데이터 형식이 올바르지 않습니다.');
      const items=data.body.items?.item??[];const rows=Array.isArray(items)?items:[items];
      result.push(...rows.map(normalize));
      if(result.length>=Number(data.body.totalCount)) return result;
      if(!rows.length) throw Error('관광 API 페이지 데이터가 누락되었습니다.');
    }
    throw Error('결과가 많습니다. 지역과 콘텐츠 유형을 더 좁혀 검색해주세요.');
  }};
}
