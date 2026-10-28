// 서버 설정. 실제 키 값은 Vercel 환경변수에만 입력합니다.
const PORTAL_SEARCH_URL = 'https://apis.data.go.kr/AAAAAAA/GetSearchDataList/v2/search';
const SERVICE_KEY_ENV = 'DATA_GO_KR_SERVICE_KEY';
function getServiceKey() { return process.env[SERVICE_KEY_ENV] || ''; }
module.exports = { PORTAL_SEARCH_URL, SERVICE_KEY_ENV, getServiceKey };
