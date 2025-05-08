"use client"

import { useState, useEffect } from "react"
import { TaskCard } from "@/components/task/task-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateTaskDialog } from "@/components/task/create-task-dialog"
import { TaskDetailDialog } from "@/components/task/task-detail-dialog"
import { Draggable } from "react-beautiful-dnd"
import { useToast } from "@/components/ui/use-toast"

export function ColumnList({ column }) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false)
  const [tasks, setTasks] = useState(column.tasks || [])
  const { toast } = useToast()

  const handleAddTask = () => {
    setIsCreateTaskOpen(true)
  }

  const handleTaskCreated = async (newTask) => {
    setIsCreateTaskOpen(false)

    // Yeni görevi ekle
    setTasks([...tasks, newTask])

    toast({
      title: "Başarılı",
      description: "Görev başarıyla oluşturuldu.",
    })
  }

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId)
    setIsTaskDetailOpen(true)
  }

  const handleTaskUpdated = (updatedTask) => {
    // Görevi güncelle
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
  }

  const handleTaskDeleted = (taskId) => {
    // Görevi sil
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  // column.tasks değiştiğinde tasks state'ini güncelle
  useEffect(() => {
    setTasks(column.tasks || [])
  }, [column.tasks])

  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`${snapshot.isDragging ? "opacity-70" : ""}`}
              onClick={() => handleTaskClick(task.id)}
            >
              <TaskCard task={task} />
            </div>
          )}
        </Draggable>
      ))}

      {tasks.length === 0 && (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-600 p-2 text-center text-sm text-gray-400">
          Bu sütunda görev bulunmuyor
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-600/50"
        onClick={handleAddTask}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        <span>Görev Ekle</span>
      </Button>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        columnId={column.id}
        boardId={column.board_id}
        onTaskCreated={handleTaskCreated}
      />

      {selectedTaskId && (
        <TaskDetailDialog
          open={isTaskDetailOpen}
          onOpenChange={setIsTaskDetailOpen}
          taskId={selectedTaskId}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  )
}
