import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function TaskCard({ task }) {
  // Görev durumuna göre renk belirleme
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
      case "low":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  // Görev için kısaltma oluştur (örn: "Frontend Geliştirme" -> "FG")
  const getInitials = (title) => {
    return title
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  // Görev durumuna göre badge rengi
  const getStatusBadge = (status) => {
    switch (status) {
      case "todo":
        return "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
      case "done":
        return "bg-green-500/20 text-green-500 hover:bg-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  // Görev durumunu Türkçe'ye çevir
  const getStatusText = (status) => {
    switch (status) {
      case "todo":
        return "Yapılacak"
      case "in_progress":
        return "Devam Ediyor"
      case "done":
        return "Tamamlandı"
      default:
        return status
    }
  }

  return (
    <div
      className={`p-3 mb-2 rounded bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors ${
        task.priority === "high"
          ? "border-l-4 border-red-500"
          : task.priority === "medium"
            ? "border-l-4 border-yellow-500"
            : "border-l-4 border-blue-500"
      }`}
    >
      <div className="text-sm font-medium text-white">{task.title}</div>

      {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>}

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-1">
          <Badge variant="outline" className={getStatusBadge(task.status)}>
            {getStatusText(task.status)}
          </Badge>

          {task.tags &&
            task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className={getPriorityColor(task.priority)}>
                {tag}
              </Badge>
            ))}
        </div>

        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">{getInitials(task.title)}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
