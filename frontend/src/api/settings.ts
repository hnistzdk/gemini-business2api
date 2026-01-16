import apiClient, { API_PREFIX } from './client'
import type { Settings } from '@/types/api'

export const settingsApi = {
  // 获取设置
  get: () =>
    apiClient.get<never, Settings>(`${API_PREFIX}/admin/settings`),

  // 更新设置
  update: (settings: Settings) =>
    apiClient.put(`${API_PREFIX}/admin/settings`, settings),
}
