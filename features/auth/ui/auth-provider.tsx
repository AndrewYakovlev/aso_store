"use client"

import { useEffect } from "react"
import { useAuthStore } from "../model/auth-store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser)

  useEffect(() => {
    // Проверяем авторизацию при монтировании
    fetchUser()
  }, [fetchUser])

  return <>{children}</>
}