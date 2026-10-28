const form = document.querySelector('#search-form');
const input = document.querySelector('#keyword');
const status = document.querySelector('#status');
const results = document.querySelector('#results');
const count = document.querySelector('#count');
const pagination = document.querySelector('#pagination');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
let state = { keyword: '', dataType: '', page: 1, size: 10, total: 0 };
let latestRequest = 0;
function showStatus(message, description = '') {
  status.replaceChildren();
  if (!message) { status.hidden = true; return; }
  status.hidden = false;
  const icon = document.createElement('div'); icon.className = 'empty-icon'; icon.textContent = '⌕';
  const title = document.createElement('strong'); title.textContent = message;
  const detail = document.createElement('p'); detail.textContent = description;
  status.append(icon, title, detail);
}
function text(tag, value, css) { const node = document.createElement(tag); if (css) node.className = css; node.textContent = value || '정보 없음'; return node; }
function safeUrl(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; } }
function renderItem(item) {
  const card = document.createElement('article'); card.className = 'card';
  card.append(text('span', ({ FILE:'파일데이터', API:'오픈 API', STD:'표준데이터' })[item.dataType] || item.dataType, 'tag'));
  card.append(text('h3', item.dataName));
  card.append(text('p', item.dataDescription, 'description'));
  const meta = document.createElement('div'); meta.className = 'metadata';
  for (const value of [item.organization, item.extension, item.updateDate, item.useScopeCode]) meta.append(text('span', value));
  card.append(meta);
  const url = safeUrl(item.detailPageUrl);
  if (url) { const link = text('a', '공공데이터포털에서 자세히 보기 ↗'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; card.append(link); }
  else card.append(text('span', '상세 링크 정보 없음', 'metadata'));
  return card;
}
async function search() {
  if (!state.keyword) { showStatus('검색어를 입력해 주세요.'); return; }
  const requestId = ++latestRequest; results.replaceChildren(); pagination.hidden = true; count.textContent = '';
  showStatus('데이터를 불러오고 있습니다.');
  const query = new URLSearchParams({ keyword:state.keyword, page:String(state.page), size:String(state.size) });
  if (state.dataType) query.set('dataType', state.dataType);
  try {
    const response = await fetch('/api/search?' + query);
    const body = await response.json();
    if (requestId !== latestRequest) return;
    if (!response.ok) throw new Error(body.error || '검색에 실패했습니다.');
    if (!Array.isArray(body.data)) throw new Error('검색 결과 형식을 확인할 수 없습니다.');
    state.total = body.totalCount;
    count.textContent = '검색 결과 ' + Number(state.total).toLocaleString('ko-KR') + '건';
    if (!body.data.length) { showStatus('검색 결과가 없습니다.', '다른 검색어나 데이터 유형을 선택해 보세요.'); return; }
    showStatus(''); results.append(...body.data.map(renderItem));
    document.querySelector('#page-label').textContent = state.page + ' 페이지'; previous.disabled = state.page <= 1;
    next.disabled = state.page * state.size >= state.total; pagination.hidden = false;
  } catch (error) { if (requestId === latestRequest) showStatus('검색을 완료하지 못했습니다.', error.message); }
}
form.addEventListener('submit', event => { event.preventDefault(); state.keyword = input.value.trim(); state.page = 1; search(); });
document.querySelectorAll('[data-keyword]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.keyword; state.keyword = input.value; state.page = 1; search(); }));
document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-type]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); }); state.dataType = button.dataset.type; state.page = 1; if (state.keyword) search(); }));
previous.addEventListener('click', () => { if (state.page > 1) { state.page--; search(); } });
next.addEventListener('click', () => { if (state.page * state.size < state.total) { state.page++; search(); } });
