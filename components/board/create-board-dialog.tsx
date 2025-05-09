"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createBoard } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onBoardCreated: (board: any) => void;
}

export function CreateBoardDialog({ open, onOpenChange, onBoardCreated }: CreateBoardDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Hata",
        description: "Oturum açmış bir kullanıcı bulunamadı.",
        variant: "destructive",
      })
      return
    }
    if (!name.trim()) {
      toast({
        title: "Hata",
        description: "Proje adı boş olamaz.",
        variant: "destructive",
      })
      return
    }

    try {
      // Gerçek API'ye istek gönderilecek
      const newBoard = await createBoard({
        name,
        description,
        user_id: user.id,
      })

      toast({
        title: "Başarılı",
        description: "Proje başarıyla oluşturuldu.",
      })

      onBoardCreated(newBoard)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Proje oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni Proje Oluştur</DialogTitle>
            <DialogDescription>Yeni bir proje oluşturmak için aşağıdaki bilgileri doldurun.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Proje Adı</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Web Sitesi Geliştirme"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proje hakkında kısa bir açıklama"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit">
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
