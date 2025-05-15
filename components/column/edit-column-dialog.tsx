"use client"

import { useState, useEffect } from "react"
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
import { updateColumn, deleteColumn } from "@/lib/api"
import { Trash2 } from "lucide-react"

interface EditColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  column: {
    id: number
    title: string
  }
  onColumnUpdated: (updatedColumn: any) => void
  onColumnDeleted: (columnId: number) => void
}

export function EditColumnDialog({ open, onOpenChange, column, onColumnUpdated, onColumnDeleted }: EditColumnDialogProps) {
  const [title, setTitle] = useState(column.title)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setTitle(column.title)
  }, [column])

  const handleSubmit = async (e: React.FormEvent) => {
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
      const updatedColumn = await updateColumn(column.id, { title })
      const fullUpdatedColumn = { ...column, ...updatedColumn }
      onColumnUpdated(fullUpdatedColumn)
      setTimeout(() => onOpenChange(false), 0)
      toast({
        title: "Başarılı",
        description: "Sütun başarıyla güncellendi.",
      })
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Sütun güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bu sütunu silmek istediğinizden emin misiniz?")) {
      return
    }

    setIsSubmitting(true)

    try {
      await deleteColumn(column.id)
      onColumnDeleted(column.id)
      onOpenChange(false)
      toast({
        title: "Başarılı",
        description: "Sütun başarıyla silindi.",
      })
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Sütun silinirken bir hata oluştu.",
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
            <DialogTitle>Sütunu Düzenle</DialogTitle>
            <DialogDescription>Sütun bilgilerini güncelleyin veya silin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Sütun Başlığı</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sütun başlığını girin"
                required
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Sil</span>
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 