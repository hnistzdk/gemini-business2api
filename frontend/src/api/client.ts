import axios, { type AxiosInstance, type AxiosError } from 'axios'

const TOKEN_KEY = 'auth_token'

/**
 * API path prefix for cross-origin deployment
 *
 * When VITE_API_URL is set (e.g., Cloudflare Worker proxy):
 *   - API_PREFIX = '' (empty)
 *   - Requests go to: VITE_API_URL/login, VITE_API_URL/admin/*, etc.
 *
 * When VITE_API_URL is not set (Vercel deployment):
 *   - API_PREFIX = '/api'
 *   - Requests go to: /api/login, /api/admin/*, etc.
 *   - Vercel Serverless Function proxies to HF Space backend
 */
export const API_PREFIX = import.meta.env.VITE_API_URL ? '' : '/api'

// 获取存储的 Token
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// 设置 Token
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

// 清除 Token
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 创建 axios 实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  withCredentials: true, // 同源部署时仍支持 cookie 认证
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加 Token 到请求头（跨域认证）
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      clearAuthToken()
      window.location.hash = '#/login'
    }

    const errorMessage = error.response?.data
      ? (error.response.data as any).detail || (error.response.data as any).message
      : error.message

    return Promise.reject(new Error(errorMessage || '请求失败'))
  }
)

export default apiClient
