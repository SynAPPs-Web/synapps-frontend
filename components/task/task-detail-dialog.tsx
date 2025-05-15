"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { fetchTask, updateTask, deleteTask } from "@/lib/api"
import { TaskForm } from "@/components/task/task-form"
import { Trash } from "lucide-react"

export function TaskDetailDialog({ open, onOpenChange, taskId, onTaskUpdated, onTaskDeleted }) {
  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && taskId) {
      loadTask()
    }
  }, [open, taskId])

  const loadTask = async () => {
    setIsLoading(true)
    try {
      const taskData = await fetchTask(taskId)
      setTask(taskData)
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Görev bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (updatedTaskData) => {
    setIsSaving(true)
    try {
      const updatedTask = await updateTask(taskId, updatedTaskData)
      setTask(updatedTask)
      toast({
        title: "Başarılı",
        description: "Görev başarıyla güncellendi.",
      })
      onTaskUpdated(updatedTask)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Görev güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteTask(taskId)
      toast({
        title: "Başarılı",
        description: "Görev başarıyla silindi.",
      })
      onTaskDeleted(taskId)
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Görev silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#2d2d2d] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Görev Detayları</DialogTitle>
          <DialogDescription>Bu görevle ilgili detayları görüntüleyin ve düzenleyin.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-700 rounded-md"></div>
            <div className="h-24 bg-gray-700 rounded-md"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-700 rounded-md"></div>
              <div className="h-10 bg-gray-700 rounded-md"></div>
            </div>
          </div>
        ) : (
          <TaskForm task={task} onSubmit={handleSave} isSubmitting={isSaving} />
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || isLoading}>
            <Trash className="mr-2 h-4 w-4" />
            {isDeleting ? "Siliniyor..." : "Görevi Sil"}
          </Button>
          <Button type="submit" form="task-form" disabled={isSaving || isLoading}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
