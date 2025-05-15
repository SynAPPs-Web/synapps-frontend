"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, HelpCircle, LogOut } from "lucide-react"
import { NotificationPopover } from "@/components/notification/notification-popover"
import { UserNav } from "@/components/user/user-nav"
import { useAuth } from "@/components/auth/auth-provider"
import { logout } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export function Header() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      toast({
        title: "Başarılı",
        description: "Çıkış yapıldı.",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 w-full bg-[#222222] border-b border-gray-800">
      <div className="flex h-14 items-center px-4">
        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl tracking-wider text-white">SynApps</span>
          </Link>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <NotificationPopover />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
