# 공공데이터 검색 웹 화면

공공데이터포털 검색서비스(15160586)를 사용하는 Vercel 웹 화면입니다. DB는 사용하지 않습니다.

## 실행 및 배포
- Vercel 프로젝트의 서버 환경변수 `DATA_GO_KR_SERVICE_KEY`에 공공데이터포털 검색서비스의 인증키를 등록합니다. 키는 GitHub에 올리지 않습니다.
- Vercel CLI가 있는 환경에서는 프로젝트 폴더에서 `vercel dev`로 실행하고 제공된 주소로 접속합니다. 정적 파일만 열면 서버 API가 동작하지 않습니다.
- 배포 전 Vercel 프로젝트의 접근 보호와 호출량 제한을 설정하고 검증하세요. 현재 웹 API 자체에는 사용자 인증 및 호출량 제한이 구현되어 있지 않습니다.
- 파일·API·표준데이터 유형과 페이지를 지정해 검색할 수 있습니다.

## 현재 범위
- 웹 검색 화면과 `/api/search` 구현. `search-service.js`는 향후 MCP 서버에서도 사용할 공통 검색 로직입니다.
- 원격 MCP 서버, 실제 배포, 접근 제어 및 호출량 제한은 아직 구현·검증되지 않았습니다.
- 기존 `test-api.ps1`과 `credentials.local.json`은 로컬 API 테스트용입니다. 웹 서버는 파일 대신 환경변수를 사용합니다.

## 확인 (PRD)
- T-01~T-04: Vercel 환경변수 설정 후 검색, 필터·페이지, 결과 없음과 오류를 확인합니다.
- T-05~T-08: 원격 MCP, 배포, 접근 제어 구현 후 확인합니다.

## config.js와 인증키
프로젝트 기본 폴더의 `config.js`는 API 주소와 환경변수 이름을 관리하고, 서버 실행 시 `DATA_GO_KR_SERVICE_KEY`를 읽습니다. 실제 인증키를 config.js에 입력하거나 GitHub에 올리지 않습니다. Vercel 프로젝트 설정의 Environment Variables에 이름과 인증키 값을 등록한 뒤 다시 배포합니다. 로컬 PowerShell 테스트에서는 `$env:DATA_GO_KR_SERVICE_KEY`를 설정한 후 서버를 실행합니다. 기존 `credentials.local.json`은 PowerShell 테스트용이며 웹 서버가 자동으로 읽지 않습니다.