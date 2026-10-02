# 전국 행정경계 출처

원본 배포: [southkorea/southkorea-maps](https://github.com/southkorea/southkorea-maps), KOSTAT 2013 census boundaries. 저장소의 라이선스 안내는 KOSTAT 자료를 "Free to share or remix"로 명시한다. GADM 자료는 사용하지 않는다.

2026-10-02 내려받은 아래 파일은 원본 그대로 저장했다.

| 프로젝트 파일 | 원본 경로 | 개수 |
| --- | --- | --- |
| src/data/korea-provinces-2013.geo.json | kostat/2013/json/skorea_provinces_geo_simple.json | 17 |
| src/data/korea-municipalities-2013.geo.json | kostat/2013/json/skorea_municipalities_geo_simple.json | 251 |
| src/data/korea-submunicipalities-2013.geo.json | kostat/2013/json/skorea_submunicipalities_geo_simple.json | 3482 |

코드는 KOSTAT의 역사적 경계 코드다. TourAPI 지역코드와 다르며 별도 매핑으로 시도 조회만 수행한다. 2013년 이후 통합·분리·명칭 변경을 반영한 최신 경계라고 주장하지 않는다. 전국·제주·도서를 포함하지만 간소화 자료이므로 정밀 경계나 주소 판정용으로 사용하지 않는다. 한국관광공사 GW는 관광정보 공급자이며 이 폴리곤 데이터의 공급자가 아니다.
