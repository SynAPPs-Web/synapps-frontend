"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { fetchBoardMembers, requestBoardMembership, removeBoardMember } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function BoardMembersDialog({ open, onOpenChange, boardId }: { open: boolean, onOpenChange: (v: boolean) => void, boardId: number }) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      loadMembers()
    }
  }, [open, boardId])

  const loadMembers = async () => {
    setIsLoading(true)
    try {
      const data = await fetchBoardMembers(boardId)
      setMembers(data)
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Üyeler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir e-posta adresi girin.",
        variant: "destructive",
      })
      return
    }
    setIsAdding(true)
    try {
      await requestBoardMembership({
        board_id: boardId,
        email,
        inviter_id: user?.id
      })
      setEmail("")
      setShowAddForm(false)
      toast({
        title: "Başarılı",
        description: "Üyelik isteği başarıyla gönderildi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Üyelik isteği gönderilemedi.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: number, userId: number) => {
    if (userId === user?.id) {
      toast({
        title: "Hata",
        description: "Kendinizi projeden çıkaramazsınız.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Bu üyeyi projeden çıkarmak istediğinizden emin misiniz?")) {
      return
    }

    setIsRemoving(true)

    try {
      await removeBoardMember(boardId, userId)
      setMembers(members.filter((m) => m.id !== memberId))
      toast({
        title: "Başarılı",
        description: "Üye başarıyla çıkarıldı.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "Üye çıkarılırken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const isOwner = (member: any) => member.role === "owner"
  const currentUserIsOwner = members.some((m: any) => m.user_id === user?.id && m.role === "owner")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#2d2d2d] border-gray-700 text-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Proje Üyeleri</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bu projenin üyelerini görüntüleyin ve yönetin.
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => setShowAddForm((v) => !v)}
            title="Üye Ekle"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Üye Ekleme Formu */}
        {showAddForm && (
          <div className="mb-4">
            <form onSubmit={e => {
              e.preventDefault();
              // Mevcut üyeye tekrar davet engeli
              if (members.some(m => m.user?.email === email.trim())) {
                toast({
                  title: "Hata",
                  description: "Bu e-posta zaten üye.",
                  variant: "destructive",
                });
                return;
              }
              handleAddMember(e);
            }} className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="email" className="text-sm text-gray-300">
                  E-posta ile üye ekle
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>
              <Button type="submit" disabled={isAdding} className="h-10">
                {isAdding ? "Ekleniyor..." : "Ekle"}
              </Button>
            </form>
          </div>
        )}

        {/* Üye Listesi */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-gray-800 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-700 rounded"></div>
                      <div className="h-3 w-24 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-4 text-gray-400">Henüz üye bulunmuyor.</div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-700"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.image || "/placeholder.svg?height=40&width=40"} />
                    <AvatarFallback>{member.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.user?.name}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded ${member.role === "owner" ? "bg-primary/20 text-primary" : "bg-gray-700 text-gray-300"}`}>
                        {member.role === "owner" ? "Sahip" : "Üye"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{member.user?.email}</div>
                  </div>
                </div>
                {currentUserIsOwner && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleRemoveMember(member.id, member.user_id!)}
                    disabled={isRemoving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
