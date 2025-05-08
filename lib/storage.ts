// localStorage tabanlı veri saklama sistemi

// Varsayılan verileri güncelleyelim
// Varsayılan veriler - uygulama ilk kez çalıştığında kullanılacak
const defaultData = {
  users: [
    { id: 1, name: "Ahmet Yılmaz", email: "ahmet@example.com", password: "password123" },
    { id: 2, name: "Ayşe Demir", email: "ayse@example.com", password: "password123" },
    { id: 3, name: "Mehmet Kaya", email: "mehmet@example.com", password: "password123" },
  ],
  project_boards: [
    {
      id: 1,
      name: "Web Sitesi Geliştirme",
      user_id: 1,
      created_at: "2023-05-10T10:00:00Z",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: 2,
      name: "Mobil Uygulama",
      user_id: 1,
      created_at: "2023-06-15T14:30:00Z",
    },
    {
      id: 3,
      name: "Pazarlama Kampanyası",
      user_id: 2,
      created_at: "2023-07-20T09:15:00Z",
      image: "/placeholder.svg?height=300&width=400&text=Marketing",
    },
  ],
  board_members: [
    { id: 1, board_id: 1, user_id: 1, role: "owner", added_at: "2023-05-10T10:00:00Z" },
    { id: 2, board_id: 1, user_id: 2, role: "member", added_at: "2023-05-11T14:30:00Z" },
    { id: 3, board_id: 1, user_id: 3, role: "member", added_at: "2023-05-12T09:15:00Z" },
    { id: 4, board_id: 2, user_id: 1, role: "owner", added_at: "2023-06-15T14:30:00Z" },
    { id: 5, board_id: 2, user_id: 3, role: "member", added_at: "2023-06-16T10:00:00Z" },
    { id: 6, board_id: 3, user_id: 2, role: "owner", added_at: "2023-07-20T09:15:00Z" },
    { id: 7, board_id: 3, user_id: 1, role: "member", added_at: "2023-07-21T11:30:00Z" },
  ],
  columns: [
    { id: 1, title: "Yapılacaklar", board_id: 1, position: 0 },
    { id: 2, title: "Devam Edenler", board_id: 1, position: 1 },
    { id: 3, title: "Tamamlananlar", board_id: 1, position: 2 },
    { id: 4, title: "Yapılacaklar", board_id: 2, position: 0 },
    { id: 5, title: "Devam Edenler", board_id: 2, position: 1 },
    { id: 6, title: "Test", board_id: 2, position: 2 },
    { id: 7, title: "Tamamlananlar", board_id: 2, position: 3 },
    { id: 8, title: "Fikirler", board_id: 3, position: 0 },
    { id: 9, title: "Planlanıyor", board_id: 3, position: 1 },
    { id: 10, title: "Yürütülüyor", board_id: 3, position: 2 },
    { id: 11, title: "Tamamlandı", board_id: 3, position: 3 },
  ],
  tasks: [
    {
      id: 1,
      title: "API Dokümantasyonu",
      description: "REST API için dokümantasyon hazırla",
      column_id: 1,
      assigned_user_id: 2,
      status: "todo",
      priority: "high",
      tags: ["dokümantasyon", "backend"],
      created_at: "2023-07-15T10:30:00Z",
      created_by: 1,
    },
    {
      id: 2,
      title: "Tasarım İncelemesi",
      description: "UI tasarımlarını gözden geçir",
      column_id: 1,
      assigned_user_id: 1,
      status: "todo",
      priority: "medium",
      tags: ["tasarım", "UI"],
      created_at: "2023-07-16T09:45:00Z",
      created_by: 2,
    },
    {
      id: 3,
      title: "Veritabanı Şeması",
      description: "Veritabanı şemasını güncelle",
      column_id: 2,
      assigned_user_id: 3,
      status: "in_progress",
      priority: "medium",
      tags: ["veritabanı", "backend"],
      created_at: "2023-07-14T14:20:00Z",
      created_by: 1,
    },
    {
      id: 4,
      title: "Frontend Geliştirme",
      description: "Ana sayfa bileşenlerini oluştur",
      column_id: 2,
      assigned_user_id: 1,
      status: "in_progress",
      priority: "high",
      tags: ["frontend", "UI"],
      created_at: "2023-07-13T11:10:00Z",
      created_by: 3,
    },
    {
      id: 5,
      title: "Proje Planı",
      description: "Proje zaman çizelgesini oluştur",
      column_id: 3,
      assigned_user_id: 2,
      status: "done",
      priority: "low",
      tags: ["planlama", "yönetim"],
      created_at: "2023-07-10T08:30:00Z",
      created_by: 1,
    },
    {
      id: 6,
      title: "Gereksinim Analizi",
      description: "Müşteri gereksinimlerini analiz et",
      column_id: 3,
      assigned_user_id: 3,
      status: "done",
      priority: "medium",
      tags: ["analiz", "müşteri"],
      created_at: "2023-07-09T13:45:00Z",
      created_by: 2,
    },
  ],
  notifications: [
    {
      id: 1,
      user_id: 1,
      notification_type: "task_assigned",
      message: "Yeni görev atandı: API Dokümantasyonu",
      is_read: false,
      created_at: "2023-07-28T10:30:00Z",
      related_item_id: 1,
      related_item_type: "task",
    },
    {
      id: 2,
      user_id: 1,
      notification_type: "task_completed",
      message: "Mehmet Kaya 'Veritabanı Şeması' görevini tamamladı",
      is_read: false,
      created_at: "2023-07-27T15:45:00Z",
      related_item_id: 3,
      related_item_type: "task",
    },
    {
      id: 3,
      user_id: 1,
      notification_type: "board_invitation",
      message: "Web Sitesi Geliştirme panosuna davet edildiniz",
      is_read: true,
      created_at: "2023-07-26T09:15:00Z",
      related_item_id: 1,
      related_item_type: "board",
    },
  ],
  sessions: [
    // Oturum bilgileri
  ],
}

// localStorage'dan veri alma
export function getStorageData(key) {
  if (typeof window === "undefined") return null

  try {
    // localStorage'dan veriyi al
    const item = window.localStorage.getItem(`kanban_${key}`)

    // Veri yoksa varsayılan veriyi döndür ve kaydet
    if (!item) {
      if (defaultData[key]) {
        window.localStorage.setItem(`kanban_${key}`, JSON.stringify(defaultData[key]))
        return defaultData[key]
      }
      return null
    }

    // Veriyi parse et ve döndür
    return JSON.parse(item)
  } catch (error) {
    console.error(`localStorage'dan ${key} alınırken hata:`, error)
    return null
  }
}

// localStorage'a veri kaydetme
export function setStorageData(key, data) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(`kanban_${key}`, JSON.stringify(data))
  } catch (error) {
    console.error(`localStorage'a ${key} kaydedilirken hata:`, error)
  }
}

// Yeni ID oluşturma
export function generateId(items) {
  if (!items || items.length === 0) return 1
  return Math.max(...items.map((item) => item.id)) + 1
}

// Geçerli kullanıcı bilgilerini alma
export function getCurrentUser() {
  if (typeof window === "undefined") return null

  try {
    const currentUser = window.localStorage.getItem("kanban_currentUser")
    if (!currentUser) return null
    return JSON.parse(currentUser)
  } catch (error) {
    console.error("Geçerli kullanıcı bilgisi alınırken hata:", error)
    return null
  }
}

// Geçerli kullanıcıyı ayarlama
export function setCurrentUser(user) {
  if (typeof window === "undefined") return

  if (user) {
    window.localStorage.setItem("kanban_currentUser", JSON.stringify(user))
  } else {
    window.localStorage.removeItem("kanban_currentUser")
  }
}
