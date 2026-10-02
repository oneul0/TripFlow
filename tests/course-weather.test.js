import {it,expect} from 'vitest';
import {resolveStation,normalizeForecast,weatherSymbol,koreaDate,validDate} from '../src/modules/course-weather.js';
const station={id:'6401',course:'64',name:'(서울)국립중앙박물관',region:'1117000000',lat:37.523,lon:126.98};
it('WTH02 무좌표는 이름과 지역 일치, 모호한 곳과 먼 좌표는 대체하지 않는다',()=>{
 expect(resolveStation({title:'국립중앙박물관',area:'1'},[station])?.id).toBe('6401');
 expect(resolveStation({title:'국립중앙박물관',area:'6'},[station])).toBeNull();
 expect(resolveStation({title:'음식점',latitude:35,longitude:129},[station])).toBeNull();
 expect(resolveStation({title:'식당',latitude:37.523,longitude:126.981},[station])?.nearby).toBe(true);
});
it('WTH04 다른 지점/날짜 제거·중복·기상 결측·정렬',()=>{
 const row={tm:'2026-10-02 12:00',courseId:'64',spotName:station.name,spotAreaId:station.id,sky:'1',th3:'22',pop:'10'};
 const result=normalizeForecast([row,row,{...row,tm:'2026-10-02 09:00',sky:'99',th3:'-999',pop:'-1'},{...row,spotName:'다른 곳'},{...row,tm:'2026-10-03 12:00'}],station,'2026-10-02');
 expect(result).toHaveLength(2);expect(result[0]).toMatchObject({time:'09:00',sky:'unknown',temperature:null,pop:null});expect(result[1].temperature).toBe(22);
 expect(weatherSymbol('1').emoji).toBe('☀️');expect(weatherSymbol('unknown').label).toBe('미확인');
});
it('WTH01 한국 자정과 실제 달력 날짜를 검증한다',()=>{expect(koreaDate(new Date('2026-10-01T16:00Z'))).toBe('2026-10-02');expect(validDate('2026-02-30')).toBe(false);});

