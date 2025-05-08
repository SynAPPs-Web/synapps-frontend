"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { TaskForm } from "@/components/task/task-form"
import { fetchTask, updateTask, deleteTask } from "@/lib/api"
import { ArrowLeft, Trash } from "lucide-react"

export default function TaskDetailPage({ params }) {
  const { taskId } = params
  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadTask = async () => {
      try {
        const taskData = await fetchTask(taskId)
        setTask(taskData)
      } catch (error) {
        toast({
          title: "Hata",
          description: "Görev bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTask()
  }, [taskId, toast])

  const handleSave = async (updatedTaskData) => {
    setIsSaving(true)
    try {
      const updatedTask = await updateTask(taskId, updatedTaskData)
      setTask(updatedTask)
      toast({
        title: "Başarılı",
        description: "Görev başarıyla güncellendi.",
      })
      router.back()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görev güncellenirken bir hata oluştu.",
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

    try {
      await deleteTask(taskId)
      toast({
        title: "Başarılı",
        description: "Görev başarıyla silindi.",
      })
      router.back()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görev silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Görev Detayları</CardTitle>
        </CardHeader>
        <CardContent>{task && <TaskForm task={task} onSubmit={handleSave} isSubmitting={isSaving} />}</CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Görevi Sil
          </Button>
          <Button type="submit" form="task-form" disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
