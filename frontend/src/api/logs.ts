import apiClient, { API_PREFIX } from './client'
import type { AdminLogsResponse } from '@/types/api'

export const logsApi = {
  // 获取日志
  list: (params?: { limit?: number; level?: string; search?: string }) =>
    apiClient.get<never, AdminLogsResponse>(`${API_PREFIX}/admin/log`, { params }),

  // 清空日志
  clear: () =>
    apiClient.delete(`${API_PREFIX}/admin/log?confirm=yes`),
}
