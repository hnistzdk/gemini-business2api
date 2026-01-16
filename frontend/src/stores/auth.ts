import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api'
import { setAuthToken, clearAuthToken, getAuthToken } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  const lastCheckedAt = ref(0)
  const AUTH_CACHE_MS = 10000
  let checkPromise: Promise<boolean> | null = null

  // 初始化时检查是否有存储的 Token
  function init() {
    const token = getAuthToken()
    if (token) {
      isLoggedIn.value = true
    }
  }

  // 登录
  async function login(password: string) {
    isLoading.value = true
    try {
      const response = await authApi.login({ password })
      // 保存 Token 到 localStorage
      if (response.token) {
        setAuthToken(response.token)
      }
      await authApi.checkAuth()
      isLoggedIn.value = true
      lastCheckedAt.value = Date.now()
      return true
    } catch (error) {
      isLoggedIn.value = false
      clearAuthToken()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  async function logout() {
    try {
      await authApi.logout()
    } finally {
      isLoggedIn.value = false
      lastCheckedAt.value = 0
      clearAuthToken()
    }
  }

  // 检查登录状态
  async function checkAuth() {
    // 如果没有 Token，直接返回 false
    const token = getAuthToken()
    if (!token) {
      isLoggedIn.value = false
      return false
    }

    const now = Date.now()
    if (isLoggedIn.value && now - lastCheckedAt.value < AUTH_CACHE_MS) {
      return true
    }
    if (checkPromise) {
      return checkPromise
    }
    try {
      checkPromise = (async () => {
        await authApi.checkAuth()
        isLoggedIn.value = true
        return true
      })()
      return await checkPromise
    } catch (error) {
      isLoggedIn.value = false
      clearAuthToken()
      return false
    } finally {
      lastCheckedAt.value = Date.now()
      checkPromise = null
    }
  }

  // 初始化
  init()

  return {
    isLoggedIn,
    isLoading,
    login,
    logout,
    checkAuth,
  }
})
