# 요구사항과 테스트 매핑

| 요구사항 | 테스트 파일 | 검증 |
| --- | --- | --- |
| F101~F103 | tests/catalog.test.js | 유형별 샘플, API 페이지·정규화·실패·빈 결과 |
| F102~F103 | tests/services.test.js | 지역·유형·키워드 결합, 전체·빈 결과 |
| F101~F103 NF103 | tests/ui.test.js | 늦은 응답 무시, 빈 결과와 오류, 외부 문자열 안전 출력 |
| F107~F108 | tests/services.test.js | 가입 유효성·중복·해시·로그인·수정·탈퇴·재설정 |
| F107~F108 | e2e/app.spec.js | 가입부터 새로고침·수정·로그아웃·재설정·탈퇴까지 |
| NF102 | e2e/app.spec.js | 360·768·1440px의 결과 표시와 가로 넘침 |
| 확장 계약 | tests/services.test.js | 로그 비밀 필드 배제·실패 격리, AI unavailable |
| 저장소 | tests/services.test.js | 손상·버전 오류·쓰기 실패 |
| HAR-001~006 | tests/runtime.test.js, tests/harness-config.test.js, tests/services.test.js | 기본 샘플, 공개 설정 허용 목록, 테스트 fetch 차단, 로그 민감 필드 제외 |
| MAP-001~004 | tests/regions.test.js, tests/maps.test.js | 경계·구멍·다중 다각형·중복·좌표·밀도·클리핑·SDK 실패와 초기화 |
| MAP-002 MAP-005 MAP-008 | tests/map-ui.test.js, e2e/app.spec.js | 구 선택·목록 연동·장소 선택·전체 복귀·반응형 |

검증 결과는 README와 docs/map-explorer.md에 기록한다. 실제 TourAPI 인증키 기반 연동, 운영 인증, 실제 AI·로그 저장·전문 검색은 자동 검증 대상에 포함하지 않는다.
