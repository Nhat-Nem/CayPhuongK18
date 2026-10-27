import { getPublicRooms, ROOM_UPDATED_EVENT } from "@/services/roomApi"
import { getMenuDishes, MENU_UPDATED_EVENT } from "@/services/menuStore"

export type DatabaseSiteImageKind = "room" | "dish"

export type DatabaseSiteImage = {
  id: string
  title: string
  src: string
  kind: DatabaseSiteImageKind
  description: string
  category: string
}

let cachedImagesRequest: Promise<DatabaseSiteImage[]> | null = null

if (typeof window !== "undefined") {
  window.addEventListener(MENU_UPDATED_EVENT, () => { cachedImagesRequest = null })
  window.addEventListener(ROOM_UPDATED_EVENT, () => { cachedImagesRequest = null })
}

export function isDatabaseImageSource(value: string | null | undefined): value is string {
  const image = String(value ?? "").trim()
  if (!image) return false

  // Chỉ coi ảnh là ảnh lấy từ dữ liệu backend nếu trường ảnh chứa data URL,
  // URL từ nơi lưu trữ, hoặc đường dẫn upload. Không đưa ảnh mặc định /assets vào gallery.
  return (
    /^data:image\//i.test(image) ||
    /^https?:\/\//i.test(image) ||
    (/^\//.test(image) && !/^\/assets\//i.test(image))
  )
}

function resolveDatabaseImage(value: string): string {
  const image = value.trim()
  if (!image.startsWith("/")) return image

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? "")
    .trim()
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/+$/, "")

  return apiBase ? `${apiBase}${image}` : image
}

async function loadDatabaseImages(): Promise<DatabaseSiteImage[]> {
  const [roomsResult, dishesResult] = await Promise.allSettled([
    getPublicRooms(),
    getMenuDishes(),
  ] as const)
  if (roomsResult.status === "rejected" && dishesResult.status === "rejected") {
    throw new Error("Không thể tải ảnh từ cơ sở dữ liệu.")
  }
  const images: DatabaseSiteImage[] = []

  if (roomsResult.status === "fulfilled") {
    for (const room of roomsResult.value) {
      room.images.forEach((image, index) => {
        if (!isDatabaseImageSource(image)) return
        images.push({
          id: `room-${room.id}-${index}`,
          title: room.name,
          src: resolveDatabaseImage(image),
          kind: "room",
          description: room.description,
          category: room.type,
        })
      })
    }
  }

  if (dishesResult.status === "fulfilled") {
    for (const dish of dishesResult.value) {
      if (!isDatabaseImageSource(dish.image)) continue
      images.push({
        id: `dish-${dish.id}`,
        title: dish.name,
        src: resolveDatabaseImage(dish.image),
        kind: "dish",
        description: dish.description,
        category: dish.category,
      })
    }
  }

  const seen = new Set<string>()
  return images.filter((item) => {
    if (seen.has(item.src)) return false
    seen.add(item.src)
    return true
  })
}

/**
 * Lấy ảnh đã được lưu trong các bản ghi phòng và món ăn của backend hiện có.
 * Không thêm bảng, module hay endpoint backend mới.
 */
export function getDatabaseSiteImages(): Promise<DatabaseSiteImage[]> {
  if (!cachedImagesRequest) {
    cachedImagesRequest = loadDatabaseImages().catch((error) => {
      cachedImagesRequest = null
      throw error
    })
  }
  return cachedImagesRequest
}

export function getDatabaseImageFor(
  images: DatabaseSiteImage[],
  kind: DatabaseSiteImageKind | "mixed",
  index = 0,
): DatabaseSiteImage | undefined {
  const candidates = kind === "mixed" ? images : images.filter((image) => image.kind === kind)
  if (candidates.length === 0) return undefined
  return candidates[((index % candidates.length) + candidates.length) % candidates.length]
}

export function clearDatabaseSiteImageCache() {
  cachedImagesRequest = null
}
