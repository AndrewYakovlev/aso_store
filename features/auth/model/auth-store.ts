import { create } from 'zustand'
import { apiClient } from '@/shared/lib/api/client'

interface User {
  id: string
  phone: string
  email?: string
  firstName?: string
  lastName?: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  sendOTP: (phone: string) => Promise<{ userId: string; isNewUser: boolean }>
  verifyOTP: (userId: string, code: string, anonymousId?: string) => Promise<void>
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  sendOTP: async (phone: string) => {
    const response = await apiClient.post<{
      success: boolean
      data: { userId: string; isNewUser: boolean }
    }>('/auth/send-otp', { phone })
    
    return response.data
  },

  verifyOTP: async (userId: string, code: string, anonymousId?: string) => {
    set({ isLoading: true })
    
    try {
      const response = await apiClient.post<{
        success: boolean
        data: { user: User }
      }>('/auth/verify-otp', { userId, code, anonymousId })
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  fetchUser: async () => {
    set({ isLoading: true })
    
    try {
      const response = await apiClient.get<{
        success: boolean
        data: { user: User }
      }>('/auth/me')
      
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      console.log('[Auth] Failed to fetch user:', error.status)
      
      // Если 401, пробуем обновить токен
      if (error.status === 401) {
        try {
          console.log('[Auth] Attempting token refresh...')
          const refreshResponse = await apiClient.post('/auth/refresh')
          console.log('[Auth] Token refreshed successfully', refreshResponse)
          
          // Пробуем снова получить пользователя
          const response = await apiClient.get<{
            success: boolean
            data: { user: User }
          }>('/auth/me')
          
          console.log('[Auth] User data after refresh:', response.data.user)
          
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          })
          return
        } catch (refreshError: any) {
          console.log('[Auth] Token refresh failed:', refreshError.message)
        }
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  logout: async () => {
    await apiClient.post('/auth/logout')
    set({
      user: null,
      isAuthenticated: false,
    })
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },
}))