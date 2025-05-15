"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchUsers, fetchColumns, fetchBoardMembers } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface TaskFormProps {
  task?: {
    title?: string;
    description?: string;
    priority?: string;
    assigned_user_id?: number;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    priority: string;
    assigned_user_id: number | null;
  }) => void;
  isSubmitting: boolean;
  boardId: number;
}

export function TaskForm({ task, onSubmit, isSubmitting, boardId }: TaskFormProps): React.ReactElement {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [priority, setPriority] = useState(task?.priority || "medium")
  const [assignedUserId, setAssignedUserId] = useState(task?.assigned_user_id?.toString() || "")
  const [users, setUsers] = useState<Array<{ id: number; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (!boardId) return;
    const loadUsers = async () => {
      try {
        const usersData = await fetchBoardMembers(boardId)
        setUsers(usersData.map(m => m.user))
      } catch (error) {
        toast({
          title: "Hata",
          description: "Kullanıcılar yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadUsers()
  }, [boardId])

  useEffect(() => {
    if (task?.assigned_user_id) {
      setAssignedUserId(task.assigned_user_id.toString());
    } else {
      setAssignedUserId("");
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Görev başlığı boş olamaz.",
        variant: "destructive",
      })
      return
    }
    onSubmit({
      title,
      description,
      priority,
      assigned_user_id: assignedUserId ? Number.parseInt(assignedUserId) : null,
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded-md"></div>
        <div className="h-24 bg-gray-700 rounded-md"></div>
      </div>
    )
  }

  return (
    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white">
          Görev Başlığı <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Görev başlığı"
          required
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">
          Açıklama
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Görev açıklaması"
          rows={4}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
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
        <div className="space-y-2">
          <Label htmlFor="assignedUser" className="text-white">
            Atanan Kişi
          </Label>
          <Select value={assignedUserId} onValueChange={setAssignedUserId}>
            <SelectTrigger id="assignedUser" className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Kullanıcı seçin" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="unassigned">Atanmamış</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id.toString()} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  )
}
