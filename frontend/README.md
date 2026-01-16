# Frontend - Admin Panel

Modern admin panel built with Vue 3 + TypeScript + Tailwind CSS.

## Tech Stack

- Vue 3 + TypeScript
- Vite
- Vue Router + Pinia
- Tailwind CSS
- Axios
- ECharts

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit: http://localhost:5174

## Build

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

Build output: `dist/`

## Project Structure

```
src/
├── api/          # API requests
├── components/   # UI components
├── views/        # Page components
├── stores/       # Pinia stores
├── router/       # Vue Router
└── types/        # TypeScript types
```

## Deployment

### Option 1: Same-origin deployment (recommended)

Build frontend and copy to backend's `static/` directory:

```bash
npm run build
cp -r dist/* ../static/
```

### Option 2: Vercel + HuggingFace Spaces (cross-origin)

Deploy frontend to Vercel, backend to HF Spaces. Uses Vercel Serverless Functions as API proxy.

**HF Space Configuration:**

1. Create a Docker Space on HuggingFace
2. **Important:** Add `app_port: 7860` to README.md YAML config:
   ```yaml
   ---
   title: Your App Name
   emoji: 🚀
   colorFrom: blue
   colorTo: green
   sdk: docker
   app_port: 7860
   pinned: false
   ---
   ```
3. Set Space visibility to **Public** (required for external access)
4. Set environment variables: `ADMIN_KEY`, `DATABASE_URL` (optional)

**Vercel Configuration:**

The `api/[...path].js` serverless function proxies all API requests to HF Space:
- `/api/*` → HF Space `/*`
- `/v1/*` → HF Space `/v1/*`
- `/public/*` → HF Space `/public/*`

Environment variables (optional):
- `BACKEND_URL`: HF Space URL (default: configured in code)

**Troubleshooting:**

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on all requests | Missing `app_port` in HF README | Add `app_port: 7860` |
| 404 on all requests | Space is Private | Set Space to Public |
| 405 Method Not Allowed | Vercel rewrites don't support POST | Use Serverless Function proxy |

### Option 3: Cloudflare Worker

Use `cloudflare-worker.js` as API proxy. See comments in file for deployment steps.

## Environment Variables

Create `.env.local`:

```bash
# For same-origin deployment (leave empty)
VITE_API_URL=

# For cross-origin with external API proxy (Cloudflare Worker)
VITE_API_URL=https://your-api-proxy.workers.dev
```

## Docker Build

The root `Dockerfile` automatically builds the frontend:

```dockerfile
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
```

Build artifacts are copied to `static/` directory.