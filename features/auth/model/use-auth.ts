"use client"

import { useEffect } from "react"
import { useAuthStore } from "./auth-store"
import { apiClient } from "@/shared/lib/api/client"

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    // Получаем или создаем анонимного пользователя
    const initAnonymousUser = async () => {
      const anonymousId = localStorage.getItem("anonymousId")
      
      if (!anonymousId) {
        try {
          const response = await apiClient.post<{
            success: boolean
            data: { id: string; sessionId: string }
          }>("/auth/anonymous")
          
          localStorage.setItem("anonymousId", response.data.id)
          localStorage.setItem("sessionId", response.data.sessionId)
        } catch (error) {
          console.error("Failed to create anonymous user:", error)
        }
      }
    }

    initAnonymousUser()
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
  }
}