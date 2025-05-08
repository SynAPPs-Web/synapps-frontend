import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString) {
  if (!dateString) return ""

  const date = new Date(dateString)

  // Geçerli bir tarih değilse boş döndür
  if (isNaN(date.getTime())) return ""

  // Bugün, dün veya tarih formatı
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return "Bugün"
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Dün"
  } else {
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }
}
