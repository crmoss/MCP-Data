# 공공데이터 검색 웹 화면

공공데이터포털 검색서비스(15160586)를 사용하는 Vercel 웹 화면입니다. DB는 사용하지 않습니다.

## 실행 및 배포
- Vercel 프로젝트의 서버 환경변수 `DATA_GO_KR_SERVICE_KEY`에 공공데이터포털 검색서비스의 인증키를 등록합니다. 키는 GitHub에 올리지 않습니다.
- Vercel CLI가 있는 환경에서는 프로젝트 폴더에서 `vercel dev`로 실행하고 제공된 주소로 접속합니다. 정적 파일만 열면 서버 API가 동작하지 않습니다.
- 배포 전 Vercel 프로젝트의 접근 보호와 호출량 제한을 설정하고 검증하세요. 현재 웹 API 자체에는 사용자 인증 및 호출량 제한이 구현되어 있지 않습니다.
- 파일·API·표준데이터 유형과 페이지를 지정해 검색할 수 있습니다.

## 현재 범위
- 웹 검색 화면과 `/api/search` 구현. `search-service.js`는 향후 MCP 서버에서도 사용할 공통 검색 로직입니다.
- 원격 MCP와 Bearer 토큰 접근 제어를 추가했습니다. 실제 Vercel 배포, AI 앱 호환성 및 호출량 제한은 별도 검증이 필요합니다.
- 기존 `test-api.ps1`과 `credentials.local.json`은 로컬 API 테스트용입니다. 웹 서버는 파일 대신 환경변수를 사용합니다.

## 확인 (PRD)
- T-01~T-04: Vercel 환경변수 설정 후 검색, 필터·페이지, 결과 없음과 오류를 확인합니다.
- T-05~T-08: 원격 MCP, 배포, 접근 제어 구현 후 확인합니다.

## config.js와 인증키
프로젝트 기본 폴더의 `config.js`는 API 주소와 환경변수 이름을 관리하고, 서버 실행 시 `DATA_GO_KR_SERVICE_KEY`를 읽습니다. 실제 인증키를 config.js에 입력하거나 GitHub에 올리지 않습니다. Vercel 프로젝트 설정의 Environment Variables에 이름과 인증키 값을 등록한 뒤 다시 배포합니다. 로컬 PowerShell 테스트에서는 `$env:DATA_GO_KR_SERVICE_KEY`를 설정한 후 서버를 실행합니다. 기존 `credentials.local.json`은 PowerShell 테스트용이며 웹 서버가 자동으로 읽지 않습니다.
## 원격 MCP 연결
- 안내 페이지: `/mcp.html`; MCP 엔드포인트: `/api/mcp` (Streamable HTTP).
- Vercel에 `DATA_GO_KR_SERVICE_KEY` 외에 충분히 긴 무작위 비밀값을 `MCP_ACCESS_TOKEN` 환경변수로 추가하고 다시 배포합니다. 이 토큰은 포털 인증키와 별개입니다. 미설정 시 MCP는 503으로 닫히고, 누락·오류 토큰에는 401을 반환합니다.
- MCP 클라이언트에 엔드포인트 URL과 `Authorization: Bearer <MCP_ACCESS_TOKEN>` 헤더를 설정합니다. AI 도구가 사용자 지정 Bearer 헤더를 지원해야 하며 OAuth 로그인은 제공하지 않습니다. 클라이언트에 토큰을 입력할 때 실제 포털 인증키를 입력하지 마세요.
- `search_datasets` 입력: keyword, page(기본 1), size(기본 10, 최대 50), dataType(FILE/API/STD 선택). 브라우저 검색과 동일한 서버 검색 코드를 사용합니다.
- `pnpm install`로 고정된 MCP SDK 1.32.2과 zod 3.25.76을 설치합니다. Vercel이 lockfile을 사용해 설치합니다.
- 실제 배포 URL과 AI 클라이언트의 호환성은 재배포 후 검증하세요. 접근 토큰과 별개로 Vercel 측 호출량 제한을 적용해야 합니다.
## Vercel 호출량 제한 설정 필요
서버 인스턴스별 메모리 카운터는 서버리스 전체에 적용되지 않으므로 사용하지 않습니다. Vercel Dashboard > MCP-Data 프로젝트 > Firewall > Configure > New Rule에서 Request Path가 `/api/search` 또는 `/api/mcp`인 요청을 대상으로 IP별 Rate Limit을 설정하세요. 시작값 예시: 60초에 60건, 초과 시 429. 저장 후 Review Changes > Publish를 눌러 실제 적용하고, 반복 요청 시 429가 반환되는지 확인합니다. 예시 수치는 서비스 이용량을 보며 조정하세요. 플랜별 규칙 수·과금 조건은 Vercel 화면에서 확인해야 합니다.
https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting

검색 화면의 상세 링크는 HTTPS data.go.kr 또는 www.data.go.kr만 허용합니다. MCP 결과의 원문 정보는 외부 데이터이므로 지시가 아닌 자료로 취급하고 원문을 확인하세요.