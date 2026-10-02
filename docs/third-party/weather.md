# 기상청 관광지 예보 지점표

출처: 기상청, [관광코스별 관광지 상세 날씨 조회서비스](https://www.data.go.kr/data/15056912/openapi.do). 공공누리 제1유형(출처표시).

사용자가 제공한 기상청27_관광코스별_관광지_상세설명서.zip의 CSV를 src/data/weather-stations.json으로 변환했다. 코스 ID, 관광지 ID, 지점명, 법정동 코드, 공개 관광지 좌표만 보존했다. 문서 기준 2023-11-30이며 현재 지점 운영을 보장하지 않는다. DOCX와 API허브 명세를 대조했다.

예보는 getTourStnVilageFcst1의 courseId + spotAreaId(관광지 ID) + spotName + tm으로 제한한다. API허브와 공공데이터포털의 인증 방식/경로는 다르므로 프로젝트는 공공데이터포털 HTTPS 경로만 사용한다. 공급자 원문 응답은 저장하거나 로깅하지 않는다.
