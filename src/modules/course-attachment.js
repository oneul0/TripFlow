const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const nullableNumber=(v,max=Infinity)=>v===null||(Number.isFinite(v)&&v>=0&&v<=max);
export function validAttachment(a){
 return a===null||!!(a&&text(a.sourceCourseId,128)&&text(a.sourceUpdatedAt,40)&&Number.isFinite(Date.parse(a.sourceUpdatedAt))&&text(a.title,100)&&Array.isArray(a.places)&&a.places.length>0&&a.places.length<=100&&a.places.every(p=>p&&text(p.contentId,128)&&['sample','tourapi'].includes(p.source)&&text(p.title,200)&&typeof p.address==='string'&&p.address.length<=1000&&(p.latitude===null||Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90)&&(p.longitude===null||Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180))&&nullableNumber(a.totalDistanceMeters)&&nullableNumber(a.totalDurationSeconds)&&[null,'road-api','estimate'].includes(a.costBasis));
}
export function copyAttachment(a){
 if(!validAttachment(a))throw Error('첨부 코스의 데이터 형식을 확인해주세요.');
 if(a===null)return null;
 return {sourceCourseId:a.sourceCourseId,sourceUpdatedAt:a.sourceUpdatedAt,title:a.title,places:a.places.map(({contentId,source,title,address,latitude,longitude})=>({contentId,source,title,address,latitude,longitude})),totalDistanceMeters:a.totalDistanceMeters,totalDurationSeconds:a.totalDurationSeconds,costBasis:a.costBasis};
}
export function attachCourse(course,memberId){
 if(!course)throw Error('코스를 찾을 수 없습니다.');
 if(course.ownerId!==memberId)throw Error('본인 코스만 첨부할 수 있습니다.');
 return copyAttachment({sourceCourseId:course.id,sourceUpdatedAt:course.updatedAt,title:course.title,places:course.places,totalDistanceMeters:course.totalDistanceMeters,totalDurationSeconds:course.totalDurationSeconds,costBasis:course.costBasis});
}
