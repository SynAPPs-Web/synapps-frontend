"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Hata",
        description: "Lütfen e-posta ve şifrenizi girin.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const userData = await login(email, password)
      setUser(userData)
      toast({
        title: "Başarılı",
        description: "Giriş başarılı. Yönlendiriliyorsunuz...",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Giriş Başarısız",
        description: error.message || "Giriş yapılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e2024] p-4">
      <Card className="w-full max-w-md bg-[#2d2d2d] border-gray-700 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">SynApps</CardTitle>
          <CardDescription className="text-center text-gray-400">Hesabınıza giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Şifre</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-400">
            Henüz hesabınız yok mu?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Kayıt Ol
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500">
            Giriş yaparak, Hizmet Şartlarını ve Gizlilik Politikasını kabul etmiş olursunuz.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
