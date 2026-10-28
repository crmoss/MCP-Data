const { searchDatasets, SearchError } = require('../search-service');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error:'GET 요청만 지원합니다.' }); }
  try { return res.status(200).json(await searchDatasets(req.query)); }
  catch (error) { return res.status(error instanceof SearchError ? error.status : 500).json({ error: error instanceof SearchError ? error.message : '검색을 처리하지 못했습니다.' }); }
};
