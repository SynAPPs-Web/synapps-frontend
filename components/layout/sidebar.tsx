"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchBoards } from "@/lib/api"
import { LayoutDashboard } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [boards, setBoards] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getBoards = async () => {
      try {
        const data = await fetchBoards()
        setBoards(data)
      } catch (error) {
        console.error("Panolar yüklenirken hata:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getBoards()
  }, [])

  return (
    <div className="hidden border-r bg-background md:block w-[240px] shrink-0">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4 py-2">
          <h2 className="text-lg font-semibold">Panolarım</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 py-2">
            <h3 className="mb-2 px-4 text-sm font-semibold">Hızlı Erişim</h3>
            <div className="space-y-1">
              <Button asChild variant="ghost" className={cn("w-full justify-start", pathname === "/" && "bg-muted")}>
                <Link href="/">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Tüm Panolar
                </Link>
              </Button>
            </div>
          </div>
          <div className="px-2 py-2">
            <h3 className="mb-2 px-4 text-sm font-semibold">Son Panolar</h3>
            <div className="space-y-1">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <div key={i} className="h-9 px-4 rounded-md animate-pulse bg-muted" />)
              ) : boards.length === 0 ? (
                <p className="px-4 text-sm text-muted-foreground">Henüz pano yok</p>
              ) : (
                boards.slice(0, 5).map((board) => (
                  <Button
                    key={board.id}
                    asChild
                    variant="ghost"
                    className={cn("w-full justify-start", pathname === `/boards/${board.id}` && "bg-muted")}
                  >
                    <Link href={`/boards/${board.id}`}>
                      <span className="truncate">{board.name}</span>
                    </Link>
                  </Button>
                ))
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
