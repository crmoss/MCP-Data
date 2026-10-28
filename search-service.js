const { PORTAL_SEARCH_URL, getServiceKey } = require('./config');
class SearchError extends Error { constructor(status, message) { super(message); this.status = status; } }
async function searchDatasets(params, key = getServiceKey()) {
  const keyword = typeof params.keyword === 'string' ? params.keyword.trim() : '';
  const page = Number(params.page ?? 1), size = Number(params.size ?? 10), dataType = params.dataType || '';
  if (!keyword || keyword.length > 200 || !Number.isInteger(page) || page < 1 || page > 90000 || !Number.isInteger(size) || size < 1 || size > 50 || !['', 'FILE', 'API', 'STD'].includes(dataType)) throw new SearchError(400, '검색어 또는 검색 조건을 확인해 주세요.');
  if (!key || !key.trim()) throw new SearchError(503, '서버의 공공데이터 인증키 설정이 필요합니다.');
  let cleanKey = key.trim();
  if (/%[0-9a-f]{2}/i.test(cleanKey)) { try { cleanKey = decodeURIComponent(cleanKey); } catch { throw new SearchError(503, '서버 인증키 설정을 확인해 주세요.'); } }
  const url = new URL(PORTAL_SEARCH_URL); url.searchParams.set('serviceKey', cleanKey); url.searchParams.set('keyword', keyword); url.searchParams.set('page', page); url.searchParams.set('size', size);
  if (dataType) url.searchParams.set('dataType', dataType);
  let response;
  try { response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) }); }
  catch (error) { throw new SearchError(504, error.name === 'TimeoutError' ? '공공데이터포털 응답 시간이 초과되었습니다.' : '공공데이터포털에 연결하지 못했습니다.'); }
  if (!response.ok) throw new SearchError(502, response.status === 401 || response.status === 403 ? '포털 인증에 실패했습니다. 서비스 승인과 인증키를 확인해 주세요.' : response.status === 429 ? '포털의 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.' : '공공데이터포털에서 오류가 발생했습니다.');
  let body; try { body = await response.json(); } catch { throw new SearchError(502, '포털 응답을 읽을 수 없습니다.'); }
  if (!body?.result || !Array.isArray(body.result.data) || !Number.isFinite(Number(body.result.sum))) throw new SearchError(502, '포털 응답 형식이 올바르지 않습니다.');
  const fields = ['dataName','dataDescription','organization','dataType','extension','updateDate','useScopeCode','detailPageUrl','keywords','columns'];
  return { keyword, page, size, totalCount: Number(body.result.sum), currentCount: body.result.data.length, data: body.result.data.map(item => Object.fromEntries(fields.map(field => [field, item[field] ?? null]))) };
}
module.exports = { searchDatasets, SearchError };
