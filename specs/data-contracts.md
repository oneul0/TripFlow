# 데이터 계약

RND v2는 전국 KOSTAT2013 시도2/시군구5/읍면동7자리 식별자와 전체 경로를 사용한다. 후보 저장 상한 검증은10000개로 전국3750개를 수용한다. Catalog.preview는 `{places,totalCount,partial,mode}`를 반환하는 시도 단위 최대20개 조회다. TourAPI 시도 코드는 별도 매핑하며 행정동 코드로 오인하지 않는다. 후보 저장에 geometry·정밀좌표를 추가하지 않는다.

RND 여행 후보는 별도 키 `enjoytrip.random-candidates.v1`에 `{version:1,items:[{id,name,path,boundaryVersion,addedAt}]}`로 저장한다. 지역 코드는 KOSTAT2013 기준 문자열이다. 좌표·제스처·경계 전체는 저장/로깅하지 않는다. 손상은 자동 덮어쓰지 않고 쓰기 실패는 메모리 상태 유지와 재시도를 제공한다. 상세 계약은 [RND 명세](features/random-trip.md)를 따른다.

Place는 contentId·title·address·areaCode·contentTypeId 문자열, 선택적인 imageUrl·latitude·longitude를 가진다. TourAPI contentid·contenttypeid·areacode를 문자열로 변환하고 addr1과 addr2를 합친다. contentid·title이 없거나 JSON 구조가 맞지 않으면 실패 처리한다. API 인증·쿼터 오류는 키를 포함하지 않는 고정 안내로 변환한다.

Catalog, Search, Logger, Assistant의 정확한 함수 계약은 `src/contracts.js`에 정의한다. catalog는 지역·유형 결과, search는 전달받은 후보 내 키워드 결과를 반환한다. AI 응답은 status와 contentId·reason 목록이다. 미연결 상태는 unavailable과 빈 목록이다. 검색·AI는 AbortSignal을 받을 수 있다.

저장소 envelope는 `{version:1,data}`다. 계정은 id·email·name·salt·passwordHash·recoveryHash 문자열이며 session은 null 또는 `{id}`다. 현재 회원 반환값에는 해시와 복구코드를 노출하지 않는다. 복구코드는 가입 결과에 한 번 반환한다. 이름 수정 범위는 2~30자, 비밀번호 범위는 8~128자다.

저장소 형식·버전·권한·용량 오류를 안내하고 자동 초기화하지 않는다. 계정 쓰기 실패 시 성공으로 표시하지 않는다. 멀티 탭 동시 갱신은 localStorage에 트랜잭션이 없어 보장하지 않는다. 실제 운영에서는 동일 모놀리스의 DB 트랜잭션으로 교체한다.
