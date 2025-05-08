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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
        {/* Left side - Sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü Aç/Kapat</span>
        </Button>

        {/* Left side - Boards button */}
        <Button variant="ghost" className="text-gray-400 hover:text-white ml-2">
          <span>Boards</span>
        </Button>

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-xl tracking-wider text-white">SynApps</span>
          </Link>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <NotificationPopover />
          <UserNav />
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)}></div>

          {/* Sidebar content */}
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-[#2d2d2d] pt-5 pb-4">
            <div className="flex items-center justify-between px-4">
              <span className="font-bold text-white">Projeler</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-5 flex flex-1 flex-col overflow-y-auto">
              <nav className="flex-1 space-y-1 px-2">
                <Link
                  href="/"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Tüm Projeler
                </Link>
                <Link
                  href="/settings"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Ayarlar
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
