# TOUR-46 서버 경유 실연동

F101/HAR-002 확장. 개발 앱의 동일 서버에서 `/api/tour/list`, `/api/tour/preview` GET만 제공한다. 서버 전용 TOUR_API_KEY는 Vite define과 클라이언트 번들에 포함하지 않는다. 공개 지도 JavaScript 키만 브라우저에 제공한다. 저장·로그·회원 인증 정책은 변경하지 않으며 API 응답을 서버에 저장하지 않는다. 운영 배포 서버 및 운영 인증은 별도 범위다.

- Given sample/harness 모드, When 실행, Then 외부 서버 경로는 등록되지 않는다.
- Given live 모드와 키 없음, When 관광 조회, Then 503과 고정된 설정 안내를 반환한다. 샘플로 대체하지 않는다.
- Given live와 유효한 키, When 지역·유형·분류 조회, Then 서버가 고정된 관광공사 호스트를 호출하고 정규화된 장소를 반환한다. 클라이언트는 키를 받지 않는다.
- Given 미허용 경로·메서드·파라미터 또는 다른 Origin, When 요청, Then 외부 호출 전에 거절한다. 임의 URL·serviceKey 입력은 허용하지 않는다.
- Given 외부 실패·시간 초과, When 요청, Then 고정 안내만 반환하고 외부 오류 원문은 반환하지 않는다. 연결 종료는 외부 요청을 취소한다.
- Given 기본 첫 검색에 지역 없음, When live 조회, Then 지역 선택 안내를 제공해 불필요한 전국 다중 페이지 호출을 방지한다.

클라이언트 계약은 기존 Catalog list/preview와 동일. 쿼리: area/type/large/middle/small, 길이 제한100. 응답 `{data:Place[]|Preview}` 또는 `{error:string}`. 호출 시간 제한15초, 응답 no-store. 실제 계정 인증과 카카오 SDK 성공 여부는 자동 테스트와 별도로 확인한다.
