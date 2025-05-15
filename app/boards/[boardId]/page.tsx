"use client"

import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { PlusCircle, UserPlus, Users, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ColumnList } from "@/components/column/column-list"
import { CreateColumnDialog } from "@/components/column/create-column-dialog"
import { fetchBoard, fetchColumns, updateTask, updateColumnPosition, fetchBoardMembers, requestBoardMembership } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { BoardHeader } from "@/components/board/board-header"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { use } from "react"
import { EditColumnDialog } from "@/components/column/edit-column-dialog"

interface Task {
  id: number
  title: string
  description?: string
  status?: string
  assigned_user_id?: number
  position: number
  column_id: number
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

interface BoardMember {
  id: number
  user_id: number
  board_id: number
  role: string
  user: {
    id: number
    name: string
    email: string
    image?: string
  }
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
  const [members, setMembers] = useState<BoardMember[]>([])
  const [filteredColumns, setFilteredColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [editingColumn, setEditingColumn] = useState<Column | null>(null)

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
        
        const membersData = await fetchBoardMembers(Number(boardId))
        setMembers(membersData)
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

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "column") {
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      
      // Tüm sütunların pozisyonunu güncelle
      const updatedColumns = newColumns.map((col, idx) => ({ ...col, position: idx }));
      setColumns(updatedColumns);
      setFilteredColumns(updatedColumns);
      
      // Sütunları sırayla güncelle
      for (const col of updatedColumns) {
        try {
          await updateColumnPosition(col.id, col.position);
        } catch (error) {
          console.error("Sütun pozisyonu güncellenirken hata:", error);
        }
      }
    } else if (type === "task") {
      const sourceColIdx = columns.findIndex(col => col.id.toString() === source.droppableId);
      const destColIdx = columns.findIndex(col => col.id.toString() === destination.droppableId);
      if (sourceColIdx === -1 || destColIdx === -1) return;

      const sourceCol = columns[sourceColIdx];
      const destCol = columns[destColIdx];
      const sourceTasks = Array.from(sourceCol.tasks);
      const [movedTask] = sourceTasks.splice(source.index, 1);

      if (sourceCol.id === destCol.id) {
        // Aynı sütun içinde sıralama değişti
        sourceTasks.splice(destination.index, 0, movedTask);
        const updatedTasks = sourceTasks.map((task, idx) => ({ ...task, position: idx }));
        const updatedColumns = columns.map((col, idx) =>
          idx === sourceColIdx ? { ...col, tasks: updatedTasks } : col
        );
        setColumns(updatedColumns);
        setFilteredColumns(updatedColumns);
        
        // Görevleri sırayla güncelle
        for (const task of updatedTasks) {
          try {
            await updateTask(task.id, { position: task.position, column_id: task.column_id });
          } catch (error) {
            console.error("Görev pozisyonu güncellenirken hata:", error);
          }
        }
      } else {
        // Farklı sütuna taşındı
        const destTasks = Array.from(destCol.tasks);
        destTasks.splice(destination.index, 0, { ...movedTask, column_id: destCol.id });
        
        const updatedSourceTasks = sourceTasks.map((task, idx) => ({ ...task, position: idx }));
        const updatedDestTasks = destTasks.map((task, idx) => ({ ...task, position: idx }));
        
        const updatedColumns = columns.map((col, idx) => {
          if (idx === sourceColIdx) return { ...col, tasks: updatedSourceTasks };
          if (idx === destColIdx) return { ...col, tasks: updatedDestTasks };
          return col;
        });
        
        setColumns(updatedColumns);
        setFilteredColumns(updatedColumns);
        
        // Görevleri sırayla güncelle
        for (const task of updatedSourceTasks) {
          try {
            await updateTask(task.id, { position: task.position, column_id: task.column_id });
          } catch (error) {
            console.error("Görev pozisyonu güncellenirken hata:", error);
          }
        }
        
        for (const task of updatedDestTasks) {
          try {
            await updateTask(task.id, { position: task.position, column_id: task.column_id });
          } catch (error) {
            console.error("Görev pozisyonu güncellenirken hata:", error);
          }
        }
      }
    }
  };

  const handleColumnCreated = async (newColumn: Column) => {
    // Yeni sütunu mevcut sütunlar listesine ekle
    setColumns((prevColumns) => [...prevColumns, newColumn]);
    setIsCreateColumnOpen(false);
  };

  const handleBoardUpdated = (updatedBoard: Board) => {
    setBoard(updatedBoard)
  }

  const handleColumnUpdated = (updatedColumn: Column) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col
      )
    );
    setFilteredColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col
      )
    );
    setEditingColumn((prev) =>
      prev && prev.id === updatedColumn.id ? { ...prev, ...updatedColumn } : prev
    );
  };

  const handleColumnDeleted = (columnId: number) => {
    setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId))
    setFilteredColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId))
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
                {columns.map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-80 flex-shrink-0 ${snapshot.isDragging ? "opacity-70" : ""}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
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
                            onClick={() => setEditingColumn(column)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
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
                              <ColumnList column={column} members={members} />
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

      {editingColumn && (
        <EditColumnDialog
          open={!!editingColumn}
          onOpenChange={(open) => {
            if (!open) setEditingColumn(null);
          }}
          column={editingColumn}
          onColumnUpdated={handleColumnUpdated}
          onColumnDeleted={handleColumnDeleted}
        />
      )}
    </div>
  )
}
