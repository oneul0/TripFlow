# TOUR-45 세부 분류 탐색 (F102 확장)

- Given 탐색 화면, When 처음 열면, Then 세부 분류는 접힌 선택 입력이며 화면 깊이를 추가하지 않는다.
- Given live 모드, When 대분류·중분류를 선택하면, Then 해당 하위 분류만 선택 가능하다. 상위 변경 시 하위 선택은 초기화한다.
- Given 콘텐츠 유형 변경, When 기존 분류와 충돌할 수 있으면, Then 분류를 모두 초기화하고 해당 유형의 분류만 제공한다.
- Given 검색 제출, When 세부 분류가 선택되어 있으면, Then tour service가 classification을 catalog로 전달한다. 기존 취소·오류·빈 결과 처리는 유지한다.
- Given 필터 초기화, When 실행하면, Then 모든 분류가 해제되고 중·소분류는 비활성화된다.
- Given sample 모드, When 세부 분류를 열면, Then 샘플에 해당 정보가 없다는 안내와 비활성 입력을 제공한다. 미분류를 임의 추정하지 않는다.

데이터 계약: classification={large?:string,middle?:string,small?:string}. 빈 값은 선택 없음이다. 외부 API 명칭 변환은 기존 TOUR-44 어댑터가 담당한다. 입력 라벨과 키보드 조작, 360/768/1440px 흐름을 검증한다.
