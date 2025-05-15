"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { fetchTask, updateTask, deleteTask, fetchColumns } from "@/lib/api"
import { TaskForm } from "@/components/task/task-form"
import { Trash } from "lucide-react"

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  onTaskUpdated: (task: any) => void;
  onTaskDeleted: (taskId: number) => void;
}

export function TaskDetailDialog({ open, onOpenChange, taskId, onTaskUpdated, onTaskDeleted }: TaskDetailDialogProps) {
  const [task, setTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const [boardId, setBoardId] = useState<number | null>(null);

  useEffect(() => {
    if (open && taskId) {
      loadTask()
    }
  }, [open, taskId])

  useEffect(() => {
    const getBoardId = async () => {
      if (task && task.column_id) {
        const columns = await fetchColumns(undefined); // Tüm kolonları çek
        const column = columns.find((col: any) => col.id === task.column_id);
        if (column) setBoardId(column.board_id);
      }
    };
    getBoardId();
  }, [task]);

  const loadTask = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const taskData = await fetchTask(taskId)
      setTask(taskData)
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Görev bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (updatedTaskData: any): Promise<void> => {
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
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Görev güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (): Promise<void> => {
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
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Görev silinirken bir hata oluştu.",
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

        {console.log("Task:", task)}
        {console.log("TaskForm boardId:", task?.board_id)}
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
          task && boardId ? (
            <TaskForm key={task.id} task={task} onSubmit={handleSave} isSubmitting={isSaving} boardId={boardId} />
          ) : (
            <div className="text-red-500 p-4">Görev verisi yüklenemedi.</div>
          )
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
