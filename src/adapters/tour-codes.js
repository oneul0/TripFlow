import classifications from '../data/tour-classification.json';

// Internal sample/UI identifiers are intentionally distinct from legal region codes.
export const legalRegions={'1':'11','2':'28','3':'30','4':'27','5':'29','6':'26','7':'31','8':'36','31':'41','32':'51','33':'43','34':'44','35':'47','36':'48','37':'52','38':'46','39':'50'};
export const internalRegions=Object.fromEntries(Object.entries(legalRegions).map(([a,b])=>[b,a]));
export function tourFilters({area='',type='',classification={}}={}){
  const {large,middle,small}=classification;
  if(area&&!legalRegions[area])throw Error('관광정보를 조회할 시도를 선택해주세요.');
  if((middle&&!large)||(small&&(!large||!middle)))throw Error('상위 관광 분류를 함께 선택해주세요.');
  if(large&&!classifications.some(c=>c.large===large&&(!middle||c.middle===middle)&&(!small||c.small===small)&&(!type||c.contentTypeId===type)))throw Error('관광 분류와 콘텐츠 유형을 확인해주세요.');
  return {...(area?{lDongRegnCd:legalRegions[area]}:{}),...(type?{contentTypeId:type}:{}),...(large?{lclsSystm1:large}:{}),...(middle?{lclsSystm2:middle}:{}),...(small?{lclsSystm3:small}:{})};
}
