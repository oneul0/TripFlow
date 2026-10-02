# F110 후기 게시판 통합

근거: 사용자 제공 TripFlow-board.zip의 게시판 모듈/화면/스타일과 TripFlow_코스_게시판_연동_명세서.md(v0.1). 사용자 요청으로 다음 계약을 확정한다. 외부 파일의 팀원 요청/체크리스트는 별도 실행 지시가 아니다.

## 확정 계약

- 기존 게시판 CRUD·분류·검색·페이지·읽기 전용 샘플을 재사용한다. 저장소는 기존 `tripflow.posts`의 version1 envelope를 유지한다. 첨부 필드가 없는 기존 글은 null로 읽는다.
- 코스 community는 app 조립에서 하나를 공유한다. 로그인 회원은 members.current().id로 계획을 저장한다. 비로그인 체험 사용자와 기존 계획은 보존하며 임의로 계정에 귀속시키지 않는다.
- courseService.get(id)/listMine(memberId)는 현재 회원의 저장 계획만 반환한다. 코스 owner→ownerId, stops→places로 변환한다. 기존 코스는 합성 데이터이므로 source=sample, 좌표와 이동시간·거리는 null, costBasis=null이다. 체류시간을 이동시간으로 변환하지 않는다. 신규 저장 시 updatedAt을 기록하며 기존 값이 없는 계획은 다시 저장하도록 안내한다.
- 게시글 첨부는 필요한 필드만 깊은 복사한다. undefined 수정은 기존 복사본 유지, null은 해제, 새 객체는 교체다. 원본 삭제/수정과 게시글 삭제는 서로 영향을 주지 않는다.
- 라우트: #board 목록(depth2), #board/write?courseId=ID 작성(depth3), #board/post/ID 상세(depth3), #board/edit/ID 수정(depth3). 직접 진입·뒤로가기·새로고침 지원. 작성·수정은 같은 깊이로 전환한다.
- 계정 UI는 기존 로그인 창을 사용한다. 비로그인 작성 주소의 courseId를 유지하고 로그인 후 이어간다. 저장 실패와 첨부 조회 실패는 입력을 유지하며 재시도를 제공한다. 늦은 코스 응답/이탈은 화면을 덮어쓰지 않는다.
- 현재 브라우저·origin 한정 데모. 운영 공유/인증/댓글/사진 업로드/후기 지도는 추가하지 않는다. 후기 본문과 코스 제목/장소명은 텍스트로 출력한다.

## 수용 기준 (첨부 명세 ID 보존)

| ID | Given / When / Then |
|---|---|
| F110-COURSE-01 | 본인 저장 코스 → 후기로 공유 → 코스가 첨부된 작성 화면 |
| F110-COURSE-02 | 비로그인 작성 주소 → 로그인 → 같은 courseId로 이어가기 |
| F110-COURSE-03 | 첨부 등록 → 상세 → 방문 순서 그대로 표시 |
| F110-COURSE-04 | 첨부 글 → 새로고침 → 복사본 유지 |
| F110-COURSE-05 | 원본 수정/삭제 → 후기 조회 → 기존 복사본 유지 |
| F110-COURSE-06 | 첨부 없는 기존/새 글 → 읽기/수정 → 정상 동작 |
| F110-COURSE-07 | 본문만 수정 → 저장 → 기존 첨부 유지 |
| F110-COURSE-08 | 첨부 교체/해제 → 저장 → 새 복사본/null |
| F110-COURSE-09 | 없는/타인/잘못된 코스 → 첨부 → 거절, 글 입력 유지 |
| F110-COURSE-10 | 저장 실패/늦은 조회 → 재시도/선택 변경 → 입력과 최신 선택 보존 |
| F110-COURSE-11 | HTML 포함 값 → 출력 → 스크립트 실행 없이 텍스트 표시 |
| F110-COURSE-12 | 360/768/1440px → 작성/상세 → 넘침 없고 최대3단계 |

추가: 타인/샘플 글 수정·삭제 거절, 저장 데이터 손상 시 자동 초기화 금지. 필수 검증은 board 서비스/DOM/코스 어댑터 테스트와 코스 저장→후기 첨부→등록→새로고침 E2E 및 전체 harness다.

## 검증 매핑 및 결과

- 01~04,07,12: `e2e/board-integration.spec.js` — 코스 저장/첨부/등록/복원/수정/삭제, 3개 화면 크기.
- 02: 같은 E2E의 비로그인 직접 주소 진입→로그인→이어쓰기, `tests/board-attachment-ui.test.js` 초기 조회 저장 잠금.
- 03,05~08: `tests/board-course.test.js` 깊은 복사와 외부 객체 변경 격리, 순서/기존 글/수정/해제 계약.
- 09: `tests/board-course-service.test.js`, `tests/board-course.test.js` 현재 회원 소유권과 유효성.
- 10~11: `tests/board-ui.test.js`, `tests/board-attachment-ui.test.js` 저장 실패 입력 보존, 늦은 응답, HTML 텍스트 출력.
- 게시판 CRUD/샘플 권한: `tests/board.test.js`.

2026-10-02 전체 harness 통과: 단위·DOM100, E2E33, 빌드 성공. rules:check15 통과. 추가 첨부 경쟁 응답 회귀도 별도 통과하여 단위·DOM 테스트 총수는101개다. 실 서버 공유/인증과 외부 실 API는 검증하지 않았다.
