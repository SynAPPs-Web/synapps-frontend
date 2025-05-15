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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createTask, fetchBoardMembers } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CreateTaskDialog({ open, onOpenChange, columnId, boardId, onTaskCreated }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [assignedUserId, setAssignedUserId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      // Kullanıcıları yükle
      const loadUsers = async () => {
        try {
          const usersData = await fetchBoardMembers(boardId)
          setUsers(usersData.map(m => m.user))
        } catch (error) {
          console.error("Kullanıcılar yüklenirken hata:", error)
        }
      }
      loadUsers()
      // Form alanlarını sıfırla
      setTitle("")
      setDescription("")
      setPriority("medium")
      setAssignedUserId("")
    }
  }, [open, boardId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Görev başlığı boş olamaz.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload: any = {
        title,
        description,
        column_id: columnId,
        status: "todo",
        priority,
      };
      if (assignedUserId && assignedUserId !== "unassigned") {
        payload.assigned_user_id = Number(assignedUserId);
      }
      const newTask = await createTask(payload);

      toast({
        title: "Başarılı",
        description: "Görev başarıyla oluşturuldu.",
      })

      onTaskCreated(newTask)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görev oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#2d2d2d] border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">Yeni Görev Ekle</DialogTitle>
            <DialogDescription className="text-gray-400">Yeni bir görev ekleyin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-white">
                Görev Başlığı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: API entegrasyonunu tamamla"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white">
                Açıklama
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Görev hakkında detaylı açıklama"
                rows={3}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority" className="text-white">
                Öncelik
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="low" className="text-blue-400">
                    Düşük
                  </SelectItem>
                  <SelectItem value="medium" className="text-yellow-400">
                    Orta
                  </SelectItem>
                  <SelectItem value="high" className="text-red-400">
                    Yüksek
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedUser" className="text-white">
                Atanan Kişi
              </Label>
              <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                <SelectTrigger id="assignedUser" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="unassigned">Atanmamış</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent text-white border-gray-600 hover:bg-gray-700 hover:text-white"
            >
              İPTAL
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-gray-800 text-white hover:bg-gray-700">
              {isSubmitting ? "Oluşturuluyor..." : "EKLE"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
