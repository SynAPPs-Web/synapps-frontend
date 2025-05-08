"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable, DragResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ColumnList } from "@/components/column/column-list"
import { CreateColumnDialog } from "@/components/column/create-column-dialog"
import { fetchBoard, fetchColumns, updateTask, updateColumnPosition } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { BoardHeader } from "@/components/board/board-header"
import { use } from "react"

interface Task {
  id: number
  title: string
  description?: string
  status?: string
  assigned_user_id?: number
}

interface Column {
  id: number
  title: string
  tasks: Task[]
  position: number
}

interface Board {
  id: number
  name: string
  description?: string
  user_id: number
  created_at: string
}

interface PageProps {
  params: Promise<{
    boardId: string
  }>
}

export default function BoardPage({ params }: PageProps) {
  const { boardId } = use(params)
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const loadBoardData = async () => {
      try {
        const [boardData, columnsData] = await Promise.all([
          fetchBoard(Number(boardId)), 
          fetchColumns(Number(boardId))
        ])

        setBoard(boardData)
        setColumns(columnsData)
        setFilteredColumns(columnsData)
      } catch (error: any) {
        toast({
          title: "Hata",
          description: error.message || "Pano bilgileri yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadBoardData()
  }, [boardId, toast])

  const handleDragEnd = async (result: DragResult) => {
    const { destination, source, draggableId, type } = result

    // Sürükleme işlemi tamamlanmadıysa
    if (!destination) return

    // Aynı yere bırakıldıysa
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // Sütun sürükleme
    if (type === "column") {
      const newColumns = Array.from(columns)
      const movedColumn = newColumns.find((col) => col.id.toString() === draggableId)

      if (!movedColumn) return

      // Sütunu listeden çıkar
      const newColumnOrder = newColumns.filter((col) => col.id.toString() !== draggableId)

      // Sütunu yeni pozisyona ekle
      newColumnOrder.splice(destination.index, 0, movedColumn)

      // Pozisyonları güncelle
      const updatedColumns = newColumnOrder.map((col, index) => ({
        ...col,
        position: index,
      }))

      setColumns(updatedColumns)
      setFilteredColumns(updatedColumns)

      try {
        // API'ye güncelleme gönder
        await updateColumnPosition(draggableId, destination.index)
      } catch (error: any) {
        toast({
          title: "Hata",
          description: "Sütun taşınırken bir hata oluştu.",
          variant: "destructive",
        })

        // Hata durumunda orijinal verileri yeniden yükle
        const columnsData = await fetchColumns(Number(boardId))
        setColumns(columnsData)
        setFilteredColumns(columnsData)
      }

      return
    }

    // Görev sürükleme
    try {
      // Optimistik UI güncellemesi
      const updatedColumns = [...columns]

      // Kaynak sütundan görevi kaldır
      const sourceColumn = updatedColumns.find((col) => col.id.toString() === source.droppableId)
      if (!sourceColumn) return
      const taskToMove = sourceColumn.tasks[source.index]
      sourceColumn.tasks.splice(source.index, 1)

      // Hedef sütuna görevi ekle
      const destColumn = updatedColumns.find((col) => col.id.toString() === destination.droppableId)
      if (!destColumn) return
      destColumn.tasks.splice(destination.index, 0, taskToMove)

      setColumns(updatedColumns)
      setFilteredColumns(updatedColumns)

      // API'ye güncelleme gönder
      await updateTask(Number(draggableId), {
        column_id: Number(destination.droppableId),
      })
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Görev taşınırken bir hata oluştu.",
        variant: "destructive",
      })

      // Hata durumunda orijinal verileri yeniden yükle
      const columnsData = await fetchColumns(Number(boardId))
      setColumns(columnsData)
      setFilteredColumns(columnsData)
    }
  }

  const handleColumnCreated = (newColumn: Column) => {
    const columnWithTasks = { ...newColumn, tasks: [] }
    const updatedColumns = [...columns, columnWithTasks]
    setColumns(updatedColumns)
    setFilteredColumns(updatedColumns)
    setIsCreateColumnOpen(false)
  }

  const handleBoardUpdated = (updatedBoard: Board) => {
    setBoard(updatedBoard)
  }

  if (isLoading) {
    return (
      <div className="h-full w-full bg-[#2d2d2d] p-4">
        <div className="h-8 w-64 bg-gray-700 animate-pulse rounded mb-8"></div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 w-80 flex-shrink-0 rounded-lg bg-gray-700 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-[#2d2d2d] flex flex-col">
      {/* Board header */}
      <BoardHeader board={board} onBoardUpdated={handleBoardUpdated} />

      {/* Board content */}
      <div className="flex-1 p-4 overflow-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable 
            droppableId="columns" 
            direction="horizontal" 
            type="column" 
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided) => (
              <div className="flex space-x-4 h-full" ref={provided.innerRef} {...provided.droppableProps}>
                {filteredColumns.map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`w-80 flex-shrink-0 ${snapshot.isDragging ? "opacity-70" : ""}`}
                      >
                        <div className="mb-2 flex items-center justify-between" {...provided.dragHandleProps}>
                          <h3 className="font-medium text-white">
                            {column.title}
                            {column.tasks?.length > 0 && (
                              <span className="ml-2 text-gray-400 text-sm">{column.tasks.length}</span>
                            )}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-white"
                            onClick={() => setIsCreateColumnOpen(true)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <Droppable 
                          droppableId={column.id.toString()} 
                          type="task" 
                          isDropDisabled={false}
                          isCombineEnabled={false}
                          ignoreContainerClipping={false}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-[calc(100vh-200px)] rounded-lg bg-gray-700/50 p-2 ${
                                snapshot.isDraggingOver ? "bg-gray-600/50" : ""
                              }`}
                            >
                              <ColumnList column={column} />
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {/* Add new column button */}
                <div className="w-80 flex-shrink-0">
                  <Button
                    variant="ghost"
                    className="w-full h-10 flex items-center justify-center rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50"
                    onClick={() => setIsCreateColumnOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Yeni Sütun Ekle</span>
                  </Button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <CreateColumnDialog
        open={isCreateColumnOpen}
        onOpenChange={setIsCreateColumnOpen}
        boardId={boardId}
        onColumnCreated={handleColumnCreated}
      />
    </div>
  )
}
