/**
 * Cloudflare Worker - API 代理
 * 将请求转发到 HuggingFace 后端
 *
 * 部署步骤：
 * 1. 登录 https://dash.cloudflare.com
 * 2. 进入 Workers & Pages -> Create Worker
 * 3. 粘贴此代码并部署
 * 4. 绑定自定义域名（如 api.zaiolos.fun）
 * 5. 在 Vercel 设置 VITE_API_URL=https://api.zaiolos.fun
 */

const BACKEND_URL = 'https://zaiolos-gemini2api-backend.hf.space';

// 允许的前端域名（CORS）
const ALLOWED_ORIGINS = [
  'https://gemini2api.zaiolos.fun',
  'https://gemini-business2api.vercel.app',
  'http://localhost:5173',  // 本地开发
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return handleCORS(origin);
    }

    // 构建目标 URL
    const targetUrl = BACKEND_URL + url.pathname + url.search;

    // 复制请求头，移除 Host
    const headers = new Headers(request.headers);
    headers.delete('Host');
    headers.set('Host', new URL(BACKEND_URL).host);

    try {
      // 转发请求到后端
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.arrayBuffer()
          : undefined,
      });

      // 复制响应并添加 CORS 头
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      // 添加 CORS 头
      if (ALLOWED_ORIGINS.includes(origin) || origin === '') {
        newResponse.headers.set('Access-Control-Allow-Origin', origin || '*');
        newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      return newResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
        },
      });
    }
  },
};

function handleCORS(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return new Response(null, { status: 204, headers });
}
