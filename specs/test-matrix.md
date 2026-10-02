# 요구사항과 테스트 매핑

| 요구사항 | 테스트 파일 | 검증 |
| --- | --- | --- |
| RND-10~12 | tests/random-upgrade.test.js, e2e/random-upgrade.spec.js | 원형 스핀·강체 quaternion·원근 역투영/화면정렬·전국 계층·3750개 후보 복원 |
| RND-13~14 | tests/tour-preview.test.js, tests/region-details.test.js, e2e/random-upgrade.spec.js | GW 시도 미리보기·코드 분리·취소·부분/빈 결과·SDK 실패/재시도·목록 유지 |
| RND-02~08 | tests/random-trip.test.js, tests/random-trip-ui.test.js | 발사 속도·스핀·고정 물리·경계·중복·복원·저장 실패·취소·후보 소진 |
| RND-01 RND-06~09 | e2e/random-trip.spec.js | 실제 마우스 던지기·휠·키보드·모션 감소·후보 복원·크기 변경 취소·360/768/1440px |
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

| UIA-01~05 | tests/navigation.test.js | 홈 분리·단일 화면·최대 깊이·현재 메뉴·검색 유지·잘못된 주소 |
| UIA-02~07 | e2e/navigation.spec.js | 360/768/1440px 시나리오·키보드·직접 주소/새로고침·뒤로 가기·비행 취소 |

코스 확장 CRS-01~34는 **설계만 완료, 테스트 미작성·미실행**이다. [예정 테스트 매핑](features/course-recommendation.md#개발-게이트와-테스트-계획-미작성미실행)에 따라 구현 전에 실패 테스트부터 추가한다.

코스 당일 합성 구현: tests/course-core.test.js, tests/course-boundaries.test.js, tests/course-ui.test.js, e2e/course-sharing.spec.js. 실제 구현/미구현 경계는 [CRS 매핑](features/course-recommendation.md#당일-샘플-검증-매핑)을 따른다. 위 '미작성' 기록은 최초 설계 시점이며 이 섹션이 최신이다.

UX-CRS-01~04: tests/course-simplification.test.js, e2e/course-sharing.spec.js — 첫 입력 축소, 선택 조건 접기/보존, 기본 점수 미표시, 편집 제어 숨김, 세션 조건 재사용.
DS-02 디자인 개선: docs/design-system.md에 계획·적용범위·잔여 작업 기록. tests/design-navigation.test.js로 내 여행 지역 후보 탭 검증; 전체 harness 73개 단위·DOM, 23개 E2E 통과.

| TOUR-44 | 법정동 코드 변환·신분류 계약·잘못된 좌표 | tests/tour-v44.test.js, tests/catalog.test.js, tests/tour-preview.test.js | 합성 응답, live 별도 검증 |

| TOUR-45 / F102 | 접힌 세부 분류·상하위 초기화·서비스 전달·샘플 안내 | tests/classification.test.js, e2e/classification.spec.js | 360/768/1440px, 외부 요청 차단 |

| TOUR-46 / F101 / HAR-002 | 서버 키 격리·요청 검증·실연동 경로 | tests/tour-server.test.js, tests/harness-config.test.js | 실제 부산 미리보기 20건 별도 확인 |

| MAP-20 / TOUR-47 | 전국 지도·대량 결과 페이지·지역 변경 | tests/national-explore.test.js, e2e/national-explore.spec.js | 부산·제주·경기 실조회 별도 확인 |

| MAP-21 | 실연동 초기 지도·지역 변경 자동 조회·초기화 | tests/auto-map.test.js | 합성 응답 검증 |

| MAP-22 | 지도 범위 조회·20건 이상 표시·목록 분리·늦은 응답 무시 | tests/viewport.test.js | 실제 범위224건 조회 별도 확인 |

## F104 / CB 블록 코스

| 요구사항 | 검증 |
|---|---|
| CB-01 후보 중복·출처·사용자 격리·복원 | tests/course-blocks.test.js, e2e/course-sharing.spec.js |
| CB-02 블록 정렬·삭제·취소·드래그 | e2e/course-sharing.spec.js |
| CB-03 합계·미확인·구간 초기화 | tests/course-blocks.test.js, tests/course-simplification.test.js, e2e/course-sharing.spec.js |
| CB-04 저장·공유·복사·게시판 | tests/course-blocks.test.js, e2e/course-sharing.spec.js, e2e/board-integration.spec.js |
| CB-05 기존 데이터/핵심 서비스 유지·UI 간소화 | tests/course-core.test.js, tests/course-boundaries.test.js, tests/course-simplification.test.js |
| CB-06 저장 실패·손상·제공자 취소 | tests/course-blocks.test.js, tests/course-core.test.js, tests/course-ui.test.js |
| CB-07 360/768/1440px 최대3단계 | e2e/course-sharing.spec.js |

검증 결과: harness107 단위·DOM /32 E2E /빌드 통과, rules:check15 통과. CRS의 점수·리뷰 핵심 테스트는 유지하고 이전 UI 표시 검증은 사용자 요청에 따라 CB 계약으로 대체했다.

## RND-13~16 랜덤 여행 조작 개선

- tests/random-gameplay.test.js: 극단 입력 보드 이탈 방지, 같은 거리 입력의 손속도 독립성, 근거리 육지 보정 범위.
- tests/random-upgrade.test.js: 수직 보드 투영/역투영, 깊이에 따른 원근, quaternion 회전.
- tests/random-trip-ui.test.js: 예상 착지점·지역명 UI 없음, 비행 잠금/취소/후보 저장.
- e2e/random-trip.spec.js 및 random-upgrade.spec.js: 3개 화면 크기, 실제 마우스 쓸기, 제주/읍면동, 회전, 렌더러 크기.
- 전체 harness111 단위·DOM/32 E2E/빌드 및 rules:check15 통과(2026-10-02).

RND-17: tests/random-trip-ui.test.js의 포인터 이동량/잡기 오프셋/취소 복귀, tests/random-gameplay.test.js의 놓은 위치 발사 검증. 기존 실제 쓸기/스핀 E2E 유지.

RND-18: tests/random-upgrade.test.js — 비행 투영 크기의 연속 감소/착지 지름 절반 이하/시작 공 위치 검증. 기존 포인터 집기와 발사 E2E 유지.

BRAND-01: tests/branding.test.js — TripFlow 이미지 대체 텍스트·화면 서비스명·제목·회원가입 안내 검증. 기존 e2e/app.spec.js의360/768/1440px 흐름과 전체 harness115 단위·DOM/32 E2E/빌드, rules:check15 통과.
