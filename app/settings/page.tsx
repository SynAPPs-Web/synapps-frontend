"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return
    setLoading(true)
    try {
      // Gerçek API çağrısı
      const res = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error("Hesap silinemedi.")
      setUser(null)
      toast({ title: "Hesap silindi", description: "Hesabınız kalıcı olarak silindi." })
      router.push("/register")
    } catch (e) {
      toast({ title: "Hata", description: "Hesap silinemedi.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="p-8 text-center text-gray-400">Kullanıcı bulunamadı.</div>

  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent">
      <div className="w-full max-w-md bg-[#222222] rounded-2xl shadow-xl p-8 border border-[#35373c] flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8 text-center text-white tracking-tight">Ayarlar</h1>
        <div className="mb-6 w-full">
          <div className="text-gray-400 text-sm mb-1">Kullanıcı Adı</div>
          <div className="text-base font-medium text-white bg-[#23272f] rounded px-3 py-2 w-full">{user.name}</div>
        </div>
        <div className="mb-8 w-full">
          <div className="text-gray-400 text-sm mb-1">E-posta</div>
          <div className="text-base font-medium text-white bg-[#23272f] rounded px-3 py-2 w-full">{user.email}</div>
        </div>
        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-base py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 mt-2"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? "Siliniyor..." : "Hesabımı Sil"}
        </Button>
      </div>
    </div>
  )
} 