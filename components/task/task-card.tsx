import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TaskCardProps {
  task: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    tags?: string[];
    assignee?: { name: string };
  };
}

export function TaskCard({ task }: TaskCardProps) {
  // Görev durumuna göre renk belirleme
  const getPriorityColor = (priority: string) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-500 hover:bg-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
      case "low":
        return "bg-green-200/40 text-green-700 hover:bg-green-300/60"
      default:
        return "bg-gray-500/20 text-gray-500 hover:bg-gray-500/30"
    }
  }

  // Üye adından kısaltma oluştur (örn: "Furkan Yılmaz" -> "FY")
  const getMemberInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Görev durumuna göre badge rengi
  const getStatusBadge = (status: string) => {
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
  const getStatusText = (status: string) => {
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
        (task.priority || "").toLowerCase() === "high"
          ? "border-l-4 border-red-500"
          : (task.priority || "").toLowerCase() === "medium"
            ? "border-l-4 border-yellow-500"
            : (task.priority || "").toLowerCase() === "low"
              ? "border-l-4 border-green-300"
              : "border-l-4 border-gray-500"
      }`}
    >
      <div className="text-sm font-medium text-white">{task.title}</div>

      {task.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>}

      <div className="flex justify-end items-center mt-2">
        {/* Sadece tag'ler varsa göster */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center space-x-1 mr-2">
            {task.tags.map((tag: string, index: number) => (
              <Badge key={index} className={getPriorityColor(task.priority || "")}>{tag}</Badge>
            ))}
          </div>
        )}
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">
            {getMemberInitials(task.assignee?.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
