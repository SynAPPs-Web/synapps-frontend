"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchNotifications, markNotificationAsRead, acceptBoardInvitation } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth/auth-provider"

export function NotificationPopover() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const getNotifications = async () => {
      if (!user) return
      try {
        const data = await fetchNotifications(user.id)
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      } catch (error) {
        console.error("Bildirimler yüklenirken hata:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getNotifications()
  }, [user])

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)

      // Bildirimi okundu olarak işaretle
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))

      // Okunmamış bildirimleri güncelle
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim okundu olarak işaretlenirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleAcceptInvitation = async (notificationId) => {
    try {
      await acceptBoardInvitation(notificationId)
      setNotifications(notifications.filter((n) => n.id !== notificationId))
      setUnreadCount((prev) => Math.max(0, prev - 1))
      toast({
        title: "Başarılı",
        description: "Davet kabul edildi. Board'a üye oldunuz.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Davet kabul edilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const handleRejectInvitation = async (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    setUnreadCount((prev) => Math.max(0, prev - 1))
    try {
      await markNotificationAsRead(notificationId)
      toast({
        title: "Reddedildi",
        description: "Davet reddedildi.",
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Davet reddedilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Bildirimleri göster</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-[#2d2d2d] border-gray-700" align="end">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
          <h4 className="font-medium text-white">Bildirimler</h4>
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-700 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-gray-400">
              Bildirim bulunmuyor
            </div>
          ) : (
            <div className="grid gap-1 p-1">
              {notifications.map((notification) => (
                <div key={notification.id} className={`flex flex-col gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-700 ${!notification.is_read ? "bg-gray-700/50" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${!notification.is_read ? "bg-red-500" : "bg-transparent"}`} />
                    <div className="grid gap-1 flex-1">
                      {/* Board daveti için özel mesaj ve butonlar */}
                      {notification.notification_type === "board_invitation" ? (
                        <>
                          <div className="font-medium text-white">
                            {notification.data?.board_name
                              ? `Bir board daveti: '${notification.data.board_name}'`
                              : notification.message}
                          </div>
                          <div className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</div>
                          <div className="flex gap-2 mt-1">
                            <Button size="sm" variant="default" onClick={() => handleAcceptInvitation(notification.id)}>
                              Kabul Et
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectInvitation(notification.id)}>
                              Reddet
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-white">{notification.message}</div>
                          <div className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
