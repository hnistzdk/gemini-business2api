/**
 * Vercel Serverless Function - API 代理
 * 将所有 /api/* 请求转发到 HuggingFace 后端
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://zaiolos-gemini2api-backend.hf.space';

export const config = {
  api: {
    bodyParser: false,
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

  // 构建 query string（排除 path 参数）
  const url = new URL(req.url, `http://${req.headers.host}`);
  url.searchParams.delete('path');
  const queryString = url.search;
  const targetUrl = `${BACKEND_URL}/${targetPath}${queryString}`;

  console.log(`[Proxy] ${req.method} ${targetUrl}`);

  try {
    // 只保留必要的请求头
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': req.headers['accept'] || '*/*',
      'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy',
    };

    // 保留 Authorization 头
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    // 获取原始 body
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await getRawBody(req);
      if (body.length > 0) {
        headers['Content-Length'] = body.length.toString();
      }
    }

    // 转发请求
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    console.log(`[Proxy] Response: ${response.status}`);

    // 设置响应状态
    res.status(response.status);

    // 复制响应头
    const skipHeaders = ['content-encoding', 'transfer-encoding', 'connection', 'keep-alive'];
    response.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // 返回响应
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('[Proxy] Error:', error);
    res.status(502).json({ error: error.message, target: targetUrl });
  }
}
