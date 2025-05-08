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
import { updateBoard, deleteBoard } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react"

export function BoardSettingsDialog({ open, onOpenChange, board, onBoardUpdated }) {
  const [name, setName] = useState(board?.name || "")
  const [description, setDescription] = useState(board?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Hata",
        description: "Pano adı boş olamaz.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updatedBoard = await updateBoard(board.id, {
        name,
        description,
      })

      toast({
        title: "Başarılı",
        description: "Pano başarıyla güncellendi.",
      })

      onBoardUpdated(updatedBoard)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Pano güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bu panoyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteBoard(board.id)

      toast({
        title: "Başarılı",
        description: "Pano başarıyla silindi.",
      })

      onOpenChange(false)
      router.push("/")
    } catch (error) {
      toast({
        title: "Hata",
        description: "Pano silinirken bir hata oluştu.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Pano Ayarları</DialogTitle>
            <DialogDescription>Pano bilgilerini güncelleyin veya panoyu silin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Pano Adı</Label>
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
                placeholder="Pano hakkında kısa bir açıklama"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="sm:mr-auto"
            >
              <Trash className="mr-2 h-4 w-4" />
              {isDeleting ? "Siliniyor..." : "Panoyu Sil"}
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
