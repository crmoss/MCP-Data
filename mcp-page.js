const field = document.querySelector('#mcp-url');
field.value = new URL('/api/mcp', window.location.origin).href;
document.querySelector('#copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(field.value); document.querySelector('#copy-status').textContent = '주소를 복사했습니다.'; }
  catch { field.select(); document.querySelector('#copy-status').textContent = '주소를 선택했습니다. 복사해 주세요.'; }
});
