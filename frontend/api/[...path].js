/**
 * Vercel Serverless Function - API Proxy
 *
 * Proxies all /api/*, /v1/*, /public/* requests to HuggingFace Space backend.
 *
 * Why use Serverless Function instead of Vercel rewrites?
 * - Vercel rewrites only work for GET requests
 * - POST/PUT/DELETE requests return 405 Method Not Allowed with rewrites
 * - Serverless Functions support all HTTP methods
 *
 * Configuration:
 * - Set BACKEND_URL environment variable in Vercel project settings
 * - Or modify the default URL below
 *
 * HuggingFace Space Requirements:
 * - Space must be PUBLIC (private spaces return 404)
 * - README.md must include `app_port: 7860` in YAML config
 *
 * Route mapping:
 * - /api/login    → BACKEND_URL/login
 * - /api/admin/*  → BACKEND_URL/admin/*
 * - /v1/*         → BACKEND_URL/v1/*
 * - /public/*     → BACKEND_URL/public/*
 */

const BACKEND_URL = process.env.BACKEND_URL || 'https://zaiolos-gemini2api-backend.hf.space';

export const config = {
  api: {
    bodyParser: false, // Preserve raw body for form-data support
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
  // Extract path from original URL, remove /api prefix if present
  const url = new URL(req.url, `http://${req.headers.host}`);
  let targetPath = url.pathname;

  // Remove /api prefix (frontend requests /api/*, proxy to backend /*)
  if (targetPath.startsWith('/api/')) {
    targetPath = targetPath.slice(4);
  }

  // Build query string (exclude internal 'path' parameter)
  url.searchParams.delete('path');
  const queryString = url.search;
  const targetUrl = `${BACKEND_URL}${targetPath}${queryString}`;

  console.log(`[Proxy] ${req.method} ${targetUrl}`);

  try {
    // Forward only necessary headers
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': req.headers['accept'] || '*/*',
      'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy',
    };

    // Preserve Authorization header for API authentication
    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    // Get raw body for POST/PUT/DELETE requests
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await getRawBody(req);
      if (body.length > 0) {
        headers['Content-Length'] = body.length.toString();
      }
    }

    // Forward request to backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    console.log(`[Proxy] Response: ${response.status}`);

    // Set response status
    res.status(response.status);

    // Copy response headers (skip problematic ones)
    const skipHeaders = ['content-encoding', 'transfer-encoding', 'connection', 'keep-alive'];
    response.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Return response body
    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('[Proxy] Error:', error);
    res.status(502).json({ error: error.message, target: targetUrl });
  }
}
