# 공공데이터포털 검색 API 로컬 테스트

작업 폴더: C:\MCP Data

## 인증키
credentials.local.json의 serviceKey에 발급받은 인증키를 입력합니다. credentials.example.json은 빈 양식입니다.

## 실행
```powershell
cd "C:\MCP Data"
powershell -NoProfile -ExecutionPolicy Bypass -File .\test-api.ps1
```
기본 검색어는 request.json의 교통, 페이지 1, 조회 건수 10입니다. 다른 검색어:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\test-api.ps1 -Keyword "침수"
```
-Keyword는 포털 서버의 keyword 변수로 전달합니다. 받은 페이지 내 필터가 아닙니다.

## 확인된 호출 규격
공식 문서: https://www.data.go.kr/data/15160586/openapi.do
GET https://apis.data.go.kr/AAAAAAA/GetSearchDataList/v2/search

request.json에서 operation은 search로 유지하고 parameters를 변경할 수 있습니다.
- keyword: 검색어
- page: 페이지 (90000 초과 불가)
- size: 건수 (10000 초과 불가, 테스트 기본 10)
- dataType: FILE, API, STD (미지정 시 서버 기본 동작)
- sort: _sort, inqireCo, reqCo, updtDt
- sortOrder: DESC, ASC
- 그 외 기관·분류·확장자·수정일 필터는 공식 활용명세 참고

응답 result.data: 개별 검색 결과, result.dataCount: 현재 건수, result.sum: 전체 건수.
주요 필드: dataName(제목), dataDescription(설명), organization(기관), keywords, dataType, extension, updateDate, detailPageUrl(상세주소), columns(칼럼명), useScopeCode(이용제한범위).
스크립트는 전체 건수·현재 건수·필드 목록 및 원본 JSON 구조를 표시합니다. 인증키와 요청 URL은 출력하지 않습니다.

기존 목록조회서비스(15077093)와는 다른 서비스입니다. 과거 401 응답만으로 현재 검색서비스용 키가 잘못됐다고 판단할 수 없습니다. 기본 주소만 호출하면 코드 12 오류가 날 수 있으므로 /search를 포함합니다.