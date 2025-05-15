"use client"

import { Draggable } from "@hello-pangea/dnd"
import { TaskCard } from "@/components/task/task-card"

export function ColumnCard({ column }) {
  const tasks = column.tasks || []

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
            >
              <TaskCard task={task} />
            </div>
          )}
        </Draggable>
      ))}
      {tasks.length === 0 && (
        <div className="flex h-20 items-center justify-center rounded-md border border-dashed p-2 text-center text-sm text-muted-foreground">
          Bu sütunda görev bulunmuyor
        </div>
      )}
    </div>
  )
}
