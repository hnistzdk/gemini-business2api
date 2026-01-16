import apiClient, { API_PREFIX } from './client'
import type { LoginRequest, LoginResponse } from '@/types/api'

export const authApi = {
  login: (data: LoginRequest) => {
    const payload = new URLSearchParams()
    payload.append('admin_key', data.password)
    return apiClient.post<URLSearchParams, LoginResponse>(`${API_PREFIX}/login`, payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },

  logout: () =>
    apiClient.post(`${API_PREFIX}/logout`),

  checkAuth: () =>
    apiClient.get(`${API_PREFIX}/admin/health`),
}
