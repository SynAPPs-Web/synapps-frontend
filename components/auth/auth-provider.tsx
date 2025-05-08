"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUserData } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  image?: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
}

// Kimlik doğrulama bağlamı
const AuthContext = createContext<AuthContextType | null>(null)

// Kimlik doğrulama sağlayıcısı
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUserData()
        setUser(userData)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Korumalı rotaları kontrol et
  useEffect(() => {
    if (!loading) {
      // Giriş yapmış kullanıcılar için
      if (user) {
        // Giriş yapmış kullanıcılar login/register sayfalarına erişemez
        if (pathname === "/login" || pathname === "/register") {
          router.replace("/")
        }
      } else {
        // Giriş yapmamış kullanıcılar için korumalı sayfalar
        const protectedRoutes = ["/", "/boards", "/settings"]

        // Tam eşleşme veya alt rotalar için kontrol
        const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

        if (isProtected) {
          router.replace("/login")
        }
      }
    }
  }, [user, loading, pathname, router])

  // Yükleme durumunda
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e2024]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}

// Kimlik doğrulama kancası
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
