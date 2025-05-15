// API istek fonksiyonları - FastAPI tabanlı
const API_URL = "http://localhost:8000"

import { getStorageData, setStorageData, generateId, getCurrentUser, setCurrentUser } from "./storage"

interface User {
  id: number
  name: string
  email: string
  password?: string
  image?: string
  created_at: string
  updated_at: string
}

interface Token {
  access_token: string
  token_type: string
}

// Gecikme simülasyonu
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Kimlik doğrulama işlemleri
export async function login(email: string, password: string): Promise<Omit<User, "password">> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Giriş başarısız")
  }

  const token = await response.json() as Token
  localStorage.setItem("token", token.access_token)

  // Kullanıcı bilgilerini al
  const userResponse = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  })

  if (!userResponse.ok) {
    throw new Error("Kullanıcı bilgileri alınamadı")
  }

  const userData = await userResponse.json()
  setCurrentUser(userData)
  return userData
}

export async function register(name: string, email: string, password: string): Promise<Omit<User, "password">> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Kayıt başarısız")
  }

  const userData = await response.json()
  return userData
}

export async function logout(): Promise<boolean> {
  localStorage.removeItem("token")
  setCurrentUser(null)
  return true
}

export async function getCurrentUserData() {
  const token = localStorage.getItem("token")
  if (!token) return null

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token")
      return null
    }
    throw new Error("Kullanıcı bilgileri alınamadı")
  }

  return response.json()
}

// Pano işlemleri (project_boards)
export async function fetchBoards(userId: number): Promise<any[]> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/boards/?user_id=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Boardlar alınamadı")
  return response.json()
}

export async function fetchBoard(boardId: number): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Board alınamadı")
  return response.json()
}

export async function createBoard(data: { name: string; user_id: number; description?: string }): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/boards/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Board oluşturulamadı")
  return response.json()
}

export async function updateBoard(boardId: number, data: any): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Board güncellenemedi")
  return response.json()
}

export async function deleteBoard(boardId: number): Promise<void> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/boards/${boardId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Board silinemedi")
}

// Board üyeleri işlemleri
export async function fetchBoardMembers(board_id?: number, user_id?: number): Promise<any[]> {
  const token = localStorage.getItem("token")
  let url = `${API_URL}/board-members/`
  const params = []
  if (board_id) params.push(`board_id=${board_id}`)
  if (user_id) params.push(`user_id=${user_id}`)
  if (params.length) url += `?${params.join("&")}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Board üyeleri alınamadı")
  const data = await response.json()
  // Eğer board_id verilmişse, sadece o board'a ait üyeleri döndür
  if (board_id) {
    return data.filter((member: any) => member.board_id === board_id)
  }
  return data
}

export async function requestBoardMembership(data: { board_id: number; email: string; inviter_id: number }): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/board-members/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Üyelik isteği gönderilemedi")
  return response.json()
}

export async function acceptBoardInvitation(notification_id: number): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/board-members/accept-invitation/${notification_id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("Üyelik daveti kabul edilemedi")
  return response.json()
}

export async function removeBoardMember(boardId: number, userId: number): Promise<void> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/board-members/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Üye silinemedi")
}

// Sütun işlemleri
export async function fetchColumns(boardId?: number): Promise<any[]> {
  const token = localStorage.getItem("token")
  let url = `${API_URL}/columns/`
  if (boardId !== undefined) {
    url += `?board_id=${boardId}`
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Kolonlar alınamadı")
  return response.json()
}

export async function createColumn(data: { title: string; board_id: number; position?: number }): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/columns/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Kolon oluşturulamadı")
  return response.json()
}

export async function updateColumn(columnId: number, data: any): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/columns/${columnId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Kolon güncellenemedi")
  return response.json()
}

export async function deleteColumn(columnId: number): Promise<void> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/columns/${columnId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Kolon silinemedi")
}

// Sütun pozisyonunu güncelle
export async function updateColumnPosition(columnId: string, newPosition: number): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/columns/${columnId}/position`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ position: newPosition }),
  })
  if (!response.ok) throw new Error("Sütun pozisyonu güncellenemedi")
  return response.json()
}

// Görev işlemleri
export async function fetchTasks(columnId?: number, assigned_user_id?: number): Promise<any[]> {
  const token = localStorage.getItem("token")
  let url = `${API_URL}/tasks/`
  const params = []
  if (columnId) params.push(`column_id=${columnId}`)
  if (assigned_user_id) params.push(`assigned_user_id=${assigned_user_id}`)
  if (params.length) url += `?${params.join("&")}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Görevler alınamadı")
  return response.json()
}

export async function fetchTask(taskId: number): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Görev alınamadı")
  return response.json()
}

export async function createTask(data: any): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Görev oluşturulamadı")
  return response.json()
}

export async function updateTask(taskId: number, data: any): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || "Görev güncellenemedi")
  }
  return response.json()
}

export async function deleteTask(taskId: number): Promise<void> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Görev silinemedi")
}

// Kullanıcı işlemleri
export async function fetchUsers() {
  await delay(700) // Gerçekçi gecikme

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("Oturum açmanız gerekiyor")
  }

  const users = getStorageData("users")

  // Şifreleri çıkar
  return users.map((user) => {
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  })
}

export async function fetchUser(userId) {
  await delay(500) // Gerçekçi gecikme

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error("Oturum açmanız gerekiyor")
  }

  const users = getStorageData("users")
  const user = users.find((u) => u.id === Number(userId))

  if (!user) {
    throw new Error("Kullanıcı bulunamadı")
  }

  // Şifreyi çıkar
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Bildirim işlemleri
export async function fetchNotifications(user_id?: number, is_read?: boolean): Promise<any[]> {
  const token = localStorage.getItem("token")
  let url = `${API_URL}/notifications/`
  const params = []
  if (user_id) params.push(`user_id=${user_id}`)
  if (is_read !== undefined) params.push(`is_read=${is_read}`)
  if (params.length) url += `?${params.join("&")}`
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error("Bildirimler alınamadı")
  return response.json()
}

export async function markNotificationAsRead(notification_id: number): Promise<any> {
  const token = localStorage.getItem("token")
  const response = await fetch(`${API_URL}/notifications/${notification_id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) throw new Error("Bildirim okundu olarak işaretlenemedi")
  return response.json()
}

export async function markAllNotificationsAsRead(user_id: number): Promise<any[]> {
  // Geçici olarak boş dizi döndür
  return []
}
