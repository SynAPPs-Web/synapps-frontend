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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function CreateBoardDialog({ open, onOpenChange, onBoardCreated }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [backgroundType, setBackgroundType] = useState("gradient")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Hata",
        description: "Proje adı boş olamaz.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Gerçek API'ye istek gönderilecek
      const newBoard = await createBoard({
        name,
        description,
        user_id: 1, // Aktif kullanıcı ID'si burada dinamik olarak alınmalı
        // Arka plan tipine göre image değeri eklenebilir
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
    } finally {
      setIsSubmitting(false)
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
            <div className="grid gap-2">
              <Label>Arka Plan</Label>
              <RadioGroup value={backgroundType} onValueChange={setBackgroundType} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gradient" id="gradient" />
                  <Label htmlFor="gradient" className="cursor-pointer">
                    Gradient
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="cursor-pointer">
                    Görsel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="color" id="color" />
                  <Label htmlFor="color" className="cursor-pointer">
                    Renk
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
