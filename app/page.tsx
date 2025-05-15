"use client"

import { useEffect, useState } from "react"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { CreateBoardDialog } from "@/components/board/create-board-dialog"
import { useToast } from "@/components/ui/use-toast"
import { fetchBoards } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"

export default function HomePage() {
  const [boards, setBoards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const getBoards = async () => {
      if (!user) return
      
      try {
        const data = await fetchBoards(user.id)
        setBoards(data)
      } catch (error) {
        toast({
          title: "Hata",
          description: "Panolar yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getBoards()
  }, [toast, user])

  const handleBoardCreated = (newBoard) => {
    setBoards([...boards, newBoard])
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-sidebar-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Projeler</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array(3)
              .fill(0)
              .map((_, i) => <div key={i} className="h-48 rounded-lg bg-gray-800/50 animate-pulse" />)
          ) : (
            <>
              {boards.map((board) => (
                <Link href={`/boards/${board.id}`} key={board.id} className="block h-48">
                  <div
                    className="h-full rounded-lg overflow-hidden relative group cursor-pointer transition-all hover:shadow-lg"
                    style={{
                      backgroundImage: board.image
                        ? `url(${board.image})`
                        : "linear-gradient(135deg, #3a7bd5, #9c27b0)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                      <h3 className="text-xl font-bold text-white">{board.name}</h3>
                      {board.description && (
                        <p className="text-sm text-white/80 mt-1 line-clamp-2">{board.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {/* Yeni Proje Oluştur Kartı */}
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="h-48 rounded-lg bg-white flex flex-col items-center justify-center transition-all hover:shadow-lg"
              >
                <div className="rounded-full bg-gray-100 p-3">
                  <PlusCircle className="h-8 w-8 text-gray-500" />
                </div>
                <span className="mt-4 text-gray-700 font-medium">Proje Oluştur</span>
              </button>
            </>
          )}
        </div>

        <CreateBoardDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onBoardCreated={handleBoardCreated}
        />
      </div>
    </div>
  )
}
