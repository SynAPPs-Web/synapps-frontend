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
import { useToast } from "@/components/ui/use-toast"
import { createColumn } from "@/lib/api"

export function CreateColumnDialog({ open, onOpenChange, boardId, onColumnCreated }) {
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Sütun başlığı boş olamaz.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newColumn = await createColumn({
        title,
        board_id: Number(boardId),
      })

      toast({
        title: "Başarılı",
        description: "Sütun başarıyla oluşturuldu.",
      })

      onColumnCreated(newColumn)
      onOpenChange(false)
      setTitle("") // Form'u temizle
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Sütun oluşturulurken bir hata oluştu.",
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
            <DialogTitle>Yeni Sütun Oluştur</DialogTitle>
            <DialogDescription>Panonuza yeni bir sütun ekleyin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Sütun Başlığı</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Yapılacaklar, Devam Edenler, Tamamlananlar"
                required
              />
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
