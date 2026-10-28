const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { z } = require('zod');
const { timingSafeEqual } = require('node:crypto');
const { searchDatasets, SearchError } = require('../search-service');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = process.env.MCP_ACCESS_TOKEN;
  if (!token) return res.status(503).json({ error: 'MCP 접근 토큰이 설정되지 않았습니다.' });
  const supplied = (req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)?.[1] || '';
  const expectedBytes = Buffer.from(token); const actualBytes = Buffer.from(supplied);
  if (expectedBytes.length !== actualBytes.length || !timingSafeEqual(expectedBytes, actualBytes)) {
    res.setHeader('WWW-Authenticate', 'Bearer');
    return res.status(401).json({ error: 'MCP 접근 인증이 필요합니다.' });
  }
  const server = new McpServer({ name: 'public-data-search', version: '1.0.0' });
  server.registerTool('search_datasets', {
    description: '공공데이터포털에서 공개 데이터 목록을 검색합니다. 결과는 포털 메타데이터이며 원본 데이터가 아닙니다.',
    inputSchema: { keyword: z.string().trim().min(1).max(200), page: z.number().int().min(1).max(90000).default(1), size: z.number().int().min(1).max(50).default(10), dataType: z.enum(['FILE','API','STD']).optional() },
    annotations: { readOnlyHint: true, openWorldHint: true }
  }, async args => {
    try { const result = await searchDatasets(args); return { content: [{ type: 'text', text: JSON.stringify(result) }] }; }
    catch (e) { return { isError: true, content: [{ type: 'text', text: e instanceof SearchError ? e.message : '검색을 처리하지 못했습니다.' }] }; }
  });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => { void transport.close(); void server.close(); });
  try { await server.connect(transport); await transport.handleRequest(req, res, req.body); }
  catch { if (!res.headersSent) res.status(500).json({ error: 'MCP 요청을 처리하지 못했습니다.' }); }
};
