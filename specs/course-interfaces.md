# 코스 추천·공유 인터페이스 v1

상태: 운영 v1 계약 제안 / 당일 합성 어댑터 구현. 마지막 섹션의 실제 계약과 운영 계약을 구분한다. 아래 TypeScript 표기는 구현 언어 변경이 아닌 계약 표기다. 실제 외부 응답에는 런타임 검증을 적용한다. [설계](../docs/course-recommendation-design.md)의 CRS 정책을 따른다. 기존 src/contracts.js는 변경하지 않는다.

## 공통 규약

- 내부 ID: 서버 발급 불투명 문자열, 최대128자. provider ID는 문자열로 보존. 모든 시간은 RFC3339 UTC, 여행 일정은 localDate(YYYY-MM-DD)+minuteOfDay(0..1439)+IANA timezone(기본 Asia/Seoul). 자정 넘는 방문은 다음 날짜로 분할한다.
- 좌표는 WGS84 {latitude:-90..90, longitude:-180..180} 유한수. 금액은 KRW 정수 원, 음수 불가. 시간은 정수 분, 거리는 정수 m. 통화·인원 기준이 다르면 합산하지 않는다.
- optional=조건 없음, null=조회했으나 값 없음, unknown=확인되지 않음. 의미가 다르므로 상호 대체하지 않는다. 단위·통화는 필드로 명시한다.
- 문자열 title1..100, summary0..500, description0..5000, review body1..2000. trim 후 길이 검사, HTML은 실행하지 않고 일반 텍스트로 출력한다. 이미지/첨부는 v1 범위 밖이다.
- 모든 외부 요청은 sample/live 명시 모드, timeout, AbortSignal을 갖는다. 기본 샘플·외부 요청 차단. 배열 중복 ID·비유한수·알 수 없는 enum·상한 초과는 거절한다. page cursor는 서버 발급 불투명값이며 페이지 기본20/최대50, 정렬 tie는 ID다.

## 핵심 DTO

```ts
type PlaceRef = {provider:'tourapi'|'sample'; contentId:string};
type RegionRef = {provider:'kostat'; version:'2013'; code:string; level:'province'|'city'|'town'};
type Point = {latitude:number;longitude:number};
type LocationInput =
 | {kind:'place';place:PlaceRef}
 | {kind:'region';region:RegionRef}
 | {kind:'privatePoint';point:Point;label:string}; // 비공개만 허용
// region 출발지는 이동시간의 정확한 기준점이 아니다. 경로 계산 전 출발 지점 확인 필요.
type Fact<T> = {status:'known';value:T;source:string;observedAt:string;expiresAt:string}
 | {status:'unknown';reason:'not_provided'|'unsupported'|'stale'|'provider_failed'};
type TravelRequest = {
 schemaVersion:1; origin?:LocationInput; destination?:LocationInput;
 destinationRegion?:RegionRef; mustVisit:PlaceRef[]; exclude:PlaceRef[];
 days:{date:string|null;startMinute:number;endMinute:number}[];
 timezone:string; transport:'walk'|'car'|'transit'; partySize:number;
 preferences:{tags:string[];paceRange?:{min:number;max:number};
   preferredTravelMinutes?:number;targetBudgetKRW?:number;
   importance:{interest:1|2|3;travel:1|2|3;pace:1|2|3;budget:1|2|3}};
 hardLimits:{maxTravelMinutes?:number;maxBudgetKRW?:number};
 returnToOrigin:boolean;
};
// origin/destination/destinationRegion/mustVisit 중 하나 이상 필수.
// days 1..7, end>start, partySize1..20. 날짜 미정/확정 혼합 불가. 출발지만 있으면 maxTravelMinutes 필수.
// returnToOrigin=true는 origin 필수. mustVisit와 exclude 교집합 거절.
type Stop = {id:string;place:PlaceRef;dayIndex:number;order:number;
 stayMinutes:number;arrivalMinute:number|null;departureMinute:number|null;
 required:boolean;publicNote:string};
type RouteNodeRef = {kind:'stop';stopId:string}|{kind:'origin'|'destination';dayIndex:number};
type Leg = {from:RouteNodeRef;to:RouteNodeRef;transport:TravelRequest['transport'];
 duration:Fact<number>;distance:Fact<number>; // 分 / m
 routeRef:string|null};
// 출발/도착 이동은 별도 비공개 endpoint 참조. 공개 DTO에 개인 좌표를 포함하지 않는다.
type Itinerary = {days:{index:number;stops:Stop[]}[];legs:Leg[];
 costs:{basis:'party';currency:'KRW';low:number|null;high:number|null;
   completeness:'complete'|'partial'|'unknown';included:string[];excluded:string[]};
 validation:{status:'feasible'|'incomplete'|'infeasible';issues:ConstraintIssue[]};
 dataSnapshotId:string};
type ConstraintIssue = {code:string;severity:'blocking'|'unknown'|'notice';
 field:string;stopIds:string[];messageKey:string};
type Plan = {id:string;ownerId:string;version:number;title:string;
 input:TravelRequest;itinerary:Itinerary;source:{courseId:string;revisionId:string}|null;
 createdAt:string;updatedAt:string};
type PublicStop = {id:string;place:PlaceRef;titleSnapshot:string;
 dayIndex:number;order:number;stayMinutes:number;publicNote:string};
type CourseRevision = {id:string;courseId:string;number:number;title:string;
 summary:string;description:string;stops:PublicStop[];transport:string;
 dayCount:number;tags:string[];publishedAt:string;dataSnapshotId:string};
type Course = {id:string;author:{id:string;displayName:string};
 status:'published'|'unpublished'|'deleted'|'hidden';activeRevisionId:string;
 version:number;createdAt:string;updatedAt:string};
type SavedCourse = {courseId:string;savedRevisionId:string;savedAt:string;
 availability:'available'|'unavailable';hasNewRevision:boolean};
type Review = {id:string;courseId:string;revisionId:string;authorId:string;
 rating:1|2|3|4|5;body:string;visitedMonth:string|null;version:number;
 status:'visible'|'hidden'|'deleted';createdAt:string;updatedAt:string};
type RatingSummary = {scope:'revision'|'course';revisionId:string|null;
 average:number|null;count:number;distribution:{1:number;2:number;3:number;4:number;5:number}};
type FitScore = {status:'ready'|'insufficient_data'|'incomplete'|'ineligible'|'stale';
 score:number|null;coverage:number;policyVersion:string;courseRevisionId:string;
 contextFingerprint:string;comparisonGroup:string;dataSnapshotId:string;
 generatedAt:string;expiresAt:string;
 dimensions:{id:'interest'|'travel'|'pace'|'budget';active:boolean;
   status:'known'|'unknown'|'inactive';value:number|null;weight:number;
   reasonCodes:string[];evidenceRefs:string[]}[];
 missingFields:string[];constraintIssues:ConstraintIssue[]};
```

API 공개 DTO는 위 타입 전체를 자동 직렬화하지 않는다. Plan.ownerId는 본인용 응답만, Review 공개 응답은 authorId를 공개 프로필 표시로 치환한다. 적합도 조건 지문과 근거는 본인에게만 반환하고 공유 URL에 넣지 않는다. 공개본에는 여행일·개인 출발/도착지·조건·비공개 비용 메모를 제외하고 공개 장소의 상대 일정만 포함한다. 공개 코스 평가 시 공개 stop과 현재 여행 조건으로 이동/비용을 다시 조회하며 과거 이동시간을 무조건 재사용하지 않는다.

## 내부 포트 (동일 모놀리스)

모든 async 포트 마지막 인수는 `{signal:AbortSignal,requestId:string,mode:'sample'|'live'}`. 서버 유스케이스의 actor는 인증 미들웨어가 주입하며 HTTP 본문에서 받지 않는다. 순수 점수/검증 함수는 네트워크·시계·난수·DB에 접근하지 않는다.

| 포트 | 입력 → 출력 | 책임/실패 |
| --- | --- | --- |
| PlaceCatalog.resolve | PlaceRef[] → {places,missingRefs,snapshotId} | 삭제 장소는 missingRefs, 동일 ID 중복 제거, 원본 출처 보존 |
| PlaceCatalog.search | {region?,origin?,radiusMeters?,types?,cursor?,limit} → {items,nextCursor,coverage,sourceVersion} | coverage={scope,partial,reason}; 반경/지역 매핑 미지원은 unsupported, 전국인 척 대체 금지 |
| RegionResolver.resolve | RegionRef → {tourAreaCode,tourSigunguCode?,accuracy,sourceVersion} | accuracy=exact/province_only/unsupported. 넓어진 검색 범위를 사용자에게 표시 |
| RoutingProvider.estimate | {points,transport,departureAt?} → {legs,coverage,expiresAt} | 최대41개 point; 구간별 known/unknown; unsupported 교통수단, 없는 경로와 장애 구분 |
| PlaceFacts.get | {refs,dates,partySize} → {hours,costs,accessibility,snapshotId} | 미수집 비용/영업을0·영업중으로 반환 금지 |
| CourseGenerator.generate | {request,candidateFacts,routeFacts,policyVersion} → GenerationProposal | 순서·체류 제안만. 참조는 후보 ID 부분집합, 필수 방문 모두 포함 |
| ItineraryValidator.validate | {request,itinerary,facts,policy} → validation | hard/unknown 위반 모두 반환, 허용 가능한 시간/참조 무결성 검사 |
| FitEvaluator.evaluate | {request,revision,facts,policy,now} → FitScore | 결정적 순수 계산, unknown/coverage·수식 준수 |
| PlanRepository | getOwned(actor,id), create, replace(actor,id,expectedVersion,data), delete | 소유권+낙관적 잠금; 데이터 권한 검사 필수 |
| CourseRepository | readPublic(id,revision?), publish, unpublish, delete | 게시 트랜잭션에서 revision생성+active교체; 모든 공개 조회에 상태 검사 |
| CommunityRepository | save, unsave, copy, upsertReview, deleteReview, report | user/course 고유성·권한·집계와 원자성 |

GenerationProposal={status:'generated'|'partial'|'infeasible'|'unavailable',candidates:[{days:[{placeRef,stayMinutes}[]],reasonCodes:string[]}],provider:{kind:'rules'|'ai',version:string},fallbackUsed:boolean,issues:ConstraintIssue[]}. 후보 최대3개. 서비스는 유효하지 않은 후보를 제거하고 검증된 결과만 반환한다. 모두 탈락하면 infeasible/원인 제공, 실패를 빈 성공으로 만들지 않는다. AI의 자유문 설명은 표시 전 검증/escape하고 정책 근거는 reasonCodes에서 생성한다.

기존 Assistant.recommend의 `{status,items}`와 혼용하지 않는다. 신규 CourseGenerator를 app 조립부에서 주입하고 기존 Assistant 호출자는 유지한다. MVP는 함수 기반 규칙 제공자 하나, AI 제공자는 이후 같은 적합성 테스트를 통과해야 한다.

## HTTP 계약 제안 /api/v1

실 서버 단계에서만 구현한다. same-origin 세션 쿠키(HttpOnly/Secure/SameSite)와 상태 변경 CSRF 검증을 적용한다. sample 전송은 메모리 어댑터로 대체한다. 공개 응답도 사용자별 저장 여부·적합도를 포함하면 private/no-store로 분리한다.

| Method / path | 요청 | 성공 | 인증/주요 오류 |
| --- | --- | --- | --- |
| POST /course-recommendations | TravelRequest, generationMode=rules/ai | 200 {candidates,issues,coverage,provider} | 초기 생성은 로그인 필요; 422/429/503 |
| GET /plans?cursor&limit | — | 200 Page<PlanSummary> | 본인만 |
| POST /plans | {title,input,itineraryProposal} | 201 Plan | 서버가 재검증, score/owner 입력 거절 |
| GET /plans/{id} | — | 200 Plan, ETag | 본인만; 404 |
| PATCH /plans/{id} | {title?,input?,stops?}, If-Match | 200 Plan | 412 충돌; 파생 이동/점수 재계산 |
| DELETE /plans/{id} | If-Match | 204 | 본인만; 공개 코스 자동 삭제 안 함 |
| POST /courses | {planId,planVersion,publicText,confirmPublic:true} | 201 {course,revision} | 본인 계획, 공개DTO/미리보기 일치 확인 |
| GET /courses?cursor&limit&region&tags&sort | sort=recent/rating | 200 Page<CourseCard> | published만, 미리뷰는 평균null; 별점순은 count도 노출 |
| GET /courses/{id}?revisionId | — | 200 {course,revision,ratingSummary} | 공개 상태와 버전 소속 확인, 불가404 |
| POST /courses/{id}/revisions | {planId,planVersion,publicText,confirmPublic:true}, If-Match | 201 {course,revision} | course와plan 모두 본인,412 |
| PATCH /courses/{id}/visibility | {status:published/unpublished}, If-Match | 200 Course | 본인, hidden은 관리자만 복구 |
| DELETE /courses/{id} | If-Match | 204 | 본인; 삭제 큐 등록/접근 즉시 차단 |
| PUT /me/saved-courses/{courseId} | {revisionId}, If-Match(갱신 시) | 200 SavedCourse | 공개 버전 확인; 중복 추가는 멱등 |
| GET /me/saved-courses?cursor&limit | — | 200 Page<SavedCourseCard> | 본인, 철회 본문 제외 |
| DELETE /me/saved-courses/{courseId} | — | 204 | 본인, 없는 저장도204 |
| POST /plans/from-course | {courseId,revisionId} | 201 Plan | 공개본 조회 권한 재검사, 독립 초안 |
| GET /courses/{id}/reviews?revisionId&cursor | — | 200 {page,summary} | visible 리뷰만 |
| PUT /courses/{id}/my-review | {revisionId,rating,body,visitedMonth}, If-Match(수정) | 200 Review | 본인코스403, unique user/course,412 |
| DELETE /courses/{id}/my-review | If-Match | 204 | 본인 리뷰만 |
| POST /course-fit-evaluations | {courseId,revisionId,request:TravelRequest} | 200 FitScore | 공개코스; 개인 결과 no-store, 미정보200/null |
| POST /reports | {targetType:course/review,targetId,reasonCode} | 201 {id,status:received} | 인증·중복/빈도 제한, 관리자 별도 권한 |

개인 프로필 저장 API는 v1에 추가하지 않는다. TravelRequest를 이번 여행의 평가 조건으로 사용하며 이후 PreferenceProfile 저장이 생겨도 request 값 우선 병합은 서버에서 명시적으로 한다. 로그아웃하면 개인 결과 캐시 제거. 목록별 적합도 일괄 평가는 성능 측정 후 추가하며 현재 계약을 몰래 N회 호출해 요금/지연을 늘리지 않는다.

에러 envelope: `{error:{code,messageKey,fieldErrors:[{field,code}],retryable,requestId}}`. 서버 오류 원문·키·주소·프롬프트를 반환하지 않는다. 400 MALFORMED_REQUEST, 401 AUTH_REQUIRED, 403 FORBIDDEN, 404 NOT_FOUND(타인 비공개 존재도 숨김), 409 IDEMPOTENCY_CONFLICT, 412 VERSION_CONFLICT, 422 VALIDATION_ERROR/UNRESOLVED_LOCATION, 429 RATE_LIMITED(+Retry-After), 503 PROVIDER_UNAVAILABLE. 불가능한 추천은 정상 도메인 결과200/infeasible, API 장애와 구분한다. AbortError는 UI 오류 토스트 대신 취소 상태로 처리한다.

쓰기 POST는 Idempotency-Key 필요. 사용자+operation+key 유일, canonical body hash와 응답을24시간 보관(제안). 같은 키/같은 본문은 원 응답, 다른 본문409. 생성 요청은 키 재사용 시 재과금 방지. PUT/DELETE는 자원 상태 멱등성, 수정은 If-Match required(누락428). 게시·복사·리뷰 응답 유실 후 재시도도 중복 생성되지 않는다. ETag는 version과 대응한다. 취소는 응답 대기를 중단할 뿐 이미 commit된 쓰기를 되돌리지 않으므로 쓰기 타임아웃 후 같은 키로 결과를 조회/재시도한다.

생성 timeout 초기20초, 경로/사실 조회 각5초, AI10초(전체20초내). 자동 재시도는 idempotent read의 일시 오류1회만 허용하고 취소/422/인증 오류는 재시도하지 않는다. UI는 최신 request sequence와 AbortSignal로 늦은 결과를 차단한다. 생성 성공으로 Plan 자동 생성/게시하지 않는다.

## 저장 구조와 원자성

- plans(id,owner_id,version,input_private,itinerary,source_revision_id,created_at,updated_at)
- courses(id,author_id,status,active_revision_id,version,...)
- course_revisions(id,course_id,number,public_snapshot,...), UNIQUE(course_id,number), 불변
- saved_courses(user_id,course_id,revision_id,version,...), UNIQUE(user_id,course_id)
- reviews(id,user_id,course_id,revision_id,rating,body,status,version,...), UNIQUE(user_id,course_id), rating CHECK 1..5
- reports(id,reporter_id,target_type,target_id,reason,status,...)
- idempotency_records(actor,operation,key,body_hash,result_ref,expires_at), unique 3열

revisionId가 courseId에 속하는지 저장/리뷰/조회마다 FK 또는 트랜잭션 내 검사. 게시 시 계획 version확인+새revision+course교체+idempotency를 한 트랜잭션에서 처리한다. 리뷰 집계는 초기 read-time SQL count/sum/group으로 동일 snapshot에서 계산하여 중복 집계 상태를 두지 않는다. 증분 집계가 필요해질 때만 transactional projection을 추가한다. 단일 DB, 저장소 구현체 밖에서 SQL을 호출하지 않는다. 내부 이벤트버스는 필요하지 않으며 삭제/캐시 무효화는 같은 유스케이스가 명시적으로 수행한다.

공급자 응답 캐시는 sourceVersion/요청 범위/교통/날짜 버킷/유효기간으로 키를 나눈다. 개인 위치가 포함된 경로 캐시는 사용자 범위에서만 허용하고 로그/공용 CDN에 남기지 않는다. 장소 삭제/휴무 변경 시 해당 평가를 stale로 간주하고 공개 스냅샷은 과거 정보로 표시한다. 참조가 없어졌다고 다른 장소로 자동 치환하지 않는다.

## 계약 검증 fixture와 호환성

서버 DTO와 provider별 JSON을 별도로 fixture화한다. 잘못된 좌표/식별자/단위, 중복·누락 장소, 페이징 부분 조회, AI 허위 ID, timeout/취소, 동시 쓰기, 대상 권한, 비공개 DTO 노출을 반드시 검사한다. sample/live 같은 계약 테스트를 적용하지만 실연동 성공은 별도 보고한다.

schemaVersion=1, API major=/v1, score policyVersion은 독립. 필수 필드·단위·enum 의미 변경은 새 major 또는 명시적 마이그레이션이다. 알려지지 않은 응답 필드는 무시할 수 있지만 핵심 enum 미지원은 처리 불가로 안내한다. 기존 후보 저장 v1은 읽기 전용 importer에서 검증하며 원본 유지, 사용자 선택/로그인 후만 가져온다. 규칙 점수 v1→모델 v2 전환 시 점수 섞기 금지, 구버전 캐시 무효화 및 정책별 비교 평가 후 전환한다.

## 추가 경계 규칙

TravelRequest.preferences.importance는 미입력 시 서버가 normal=2로 정규화한다. tags=[]와 paceRange 누락은 해당 점수 차원 비활성이다. paceRange는 1<=min<=max<=8, days는 오름차순이며 확정 날짜 중복 불가다. origin만 지정한 경우의 이동 상한은 목적지 탐색 반경의 근거이며 preferredTravelMinutes와 구분한다. privatePoint와 region은 공개 방문 Stop으로 직접 변환할 수 없다.

RouteNodeRef의 stopId는 해당 itinerary 내 유일 ID를 참조하며 origin/destination은 입력의 해당 비공개 지점을 참조한다. returnToOrigin의 마지막 구간은 origin을 종점으로 쓴다. 목적지가 공개 PlaceRef이고 필수 방문이라면 mustVisit에도 명시적으로 정규화한다. 최종 목적지가 개인 지점이면 공개본에서 제외한다. 여러 날 사이 숙박/출발 위치가 미정이면 해당 연결 구간 unknown이고 완전한 이동 검증으로 표시하지 않는다.

게시 시 feasible만 허용하는 것은 아니다. 검증 결과가 incomplete인 계획은 미확인 항목을 공개 미리보기에 포함해 명시적으로 확인한 경우에만 공개할 수 있다. infeasible/유효하지 않은 장소 참조는 게시 불가다. 공개 DTO에는 validationSummary={status:feasible|incomplete,issueCodes:string[]}를 추가하고, 개인정보가 있는 원본 오류 문장은 복사하지 않는다. 공개 코스의 validationSummary와 개인 여행 조건으로 다시 계산한 평가 결과는 구분한다.

## 구현된 샘플 어댑터 계약 (2026-10-02)

현재 코스 구현은 v1 HTTP 계약 전체가 아닌 당일 합성 projection이다. `mountCourses(root,{storage,generator})`에서 생성기를 주입한다. generator.generate(input,places,{signal})는 동기 결과 또는 Promise<{status,stops,message}>를 반환한다. input={area,origin?,start,end,required,tags,pace,travelTarget,budget,importance}, stops의 id는 검증된 sample contentId만 허용한다. UI는 취소/늦은응답/알수없는ID/중복/필수누락/시간초과를 검증하고 제목·비용·체류 사실을 sample catalog에서 다시 가져온다. AI는 연결하지 않았다.

`evaluateFit(input,facts,{revisionId,now})`는 순수 계산기다. facts={interest,travelMinutes,visits,cost,complete}. 리뷰·저장 수를 받지 않는다. 반환값은 status/score/coverage/dimensions/policyVersion/revisionId/generatedAt/missingFields다. HTTP v1의 snapshot·expiresAt·comparisonGroup·조건지문은 아직 미구현이며 운영 점수로 노출하지 않는다.

`createCourseCommunity(storage)`는 별도 합성 사용자 기반 로컬 Repository+유스케이스 어댑터다. savePlan/publish/save/unsave/copy/review/deleteReview/unpublish/deletePlan을 제공하며 JSON 쓰기 성공 후에만 메모리 상태를 반영한다. 소유자/버전 검사·불변 공개본·리뷰 고유성은 단일 탭에서 검증하지만 서버 인가와 다중 탭 트랜잭션을 보장하지 않는다. 기존 회원 ID나 실제 개인정보를 사용하지 않는다. 운영 서비스로 교체할 때 인증된 actor·공개 DTO·멱등/낙관잠금·삭제 정책을 전체 계약에 맞게 구현해야 한다.
