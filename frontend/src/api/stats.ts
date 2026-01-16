import apiClient, { API_PREFIX } from './client'
import type { AdminStats } from '@/types/api'

export const statsApi = {
  overview() {
    return apiClient.get<AdminStats>(`${API_PREFIX}/admin/stats`)
  },
}
