import apiClient, { API_PREFIX } from './client'
import type { AccountsConfigResponse, AccountsListResponse, AccountConfigItem } from '@/types/api'

export const accountsApi = {
  // 获取账户列表
  list: () =>
    apiClient.get<never, AccountsListResponse>(`${API_PREFIX}/admin/accounts`),

  // 获取账户配置
  getConfig: () =>
    apiClient.get<never, AccountsConfigResponse>(`${API_PREFIX}/admin/accounts-config`),

  // 更新账户配置
  updateConfig: (accounts: AccountConfigItem[]) =>
    apiClient.put(`${API_PREFIX}/admin/accounts-config`, accounts),

  // 删除账户
  delete: (accountId: string) =>
    apiClient.delete(`${API_PREFIX}/admin/accounts/${accountId}`),

  // 禁用账户
  disable: (accountId: string) =>
    apiClient.put(`${API_PREFIX}/admin/accounts/${accountId}/disable`),

  // 启用账户
  enable: (accountId: string) =>
    apiClient.put(`${API_PREFIX}/admin/accounts/${accountId}/enable`),
}
