/**
 * Vercel Serverless Function - API 代理
 * 将所有 /api/* 请求转发到 HuggingFace 后端
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://zaiolos-gemini2api-backend.hf.space';

export const config = {
  api: {
    bodyParser: false, // 禁用默认解析，保留原始 body
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path || '';

  // 构建目标 URL（去掉 query 中的 path 参数）
  const url = new URL(req.url, `http://${req.headers.host}`);
  url.searchParams.delete('path');
  const queryString = url.search;
  const targetUrl = `${BACKEND_URL}/${targetPath}${queryString}`;

  try {
    // 构建请求头
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (!['host', 'content-length', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    }
    headers['host'] = new URL(BACKEND_URL).host;

    // 获取原始 body
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await getRawBody(req);
    }

    // 转发请求
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // 设置响应状态和头
    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // 返回响应
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ error: error.message });
  }
}
