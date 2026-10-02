# 모듈형 모놀리식 아키텍처

하나의 애플리케이션, 하나의 의존성 그래프, 하나의 빌드와 배포 단위로 유지한다. 서비스 간 통신·메시지 브로커·별도 검색 서버는 도입하지 않는다. `src/app.js`가 의존성을 조립하며 UI는 서비스만 호출한다.

| 경계 | 계약 | 현재 구현 | 이후 확장 |
| --- | --- | --- | --- |
| 관광 데이터 | `catalog.list({area,type,signal}) → Promise<Place[]>` | 샘플 및 TourAPI | 같은 앱 서버의 공공 API 프록시 |
| 검색 | `search.find(places,{query}) → Promise<Place[]>` | 제목·주소 문자열 검색 | 같은 모놀리스의 색인·랭킹 모듈 |
| 로그 | `logger.record(event,{count,mode}) → void` | 제한된 필드의 개발 콘솔 | 동일 서버의 구조화 로그 저장 |
| AI | `assistant.recommend({places,preferences,signal}) → Promise<Recommendation>` | 명시적 unavailable | 동일 서버에서 AI 제공자 호출 |
| 저장소 | `store.read()`, `store.write(value)` | 버전 검증 localStorage | 서버 내부 DB repository |

계약은 `src/contracts.js` JSDoc로 정의한다. `createTourService`에 catalog·search·logger를 주입한다. AI 계약은 실제 호출이 없으며 모듈 import 및 응답 검증 테스트를 통해 확장 지점을 남긴다. UI에 작동하지 않는 AI 버튼을 노출하지 않는다. 로그 실패가 기능을 깨뜨리지 않도록 조립된 logger가 실패를 격리한다.

프론트에서 비밀키를 보호할 수 없으므로 실제 운영 AI·계정·로그 저장은 후속 동일 모놀리스 서버로 옮긴다. 현재 브라우저 로컬 계정은 학습 데모이며 해시는 서버 인증의 대체가 아니다. 브라우저가 직접 사용할 수 있도록 발급된 관광 API 키만 환경변수에 설정한다.

최초 구조는 app(UI 조립), modules(관광·회원), adapters(데이터·저장소·확장 제공자)로 제한한다. 범용 DI 컨테이너·이벤트버스·기반 클래스는 만들지 않는다.
