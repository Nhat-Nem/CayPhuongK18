import type { RoomPrototype, RoomStatus } from "@/data/roomPrototype"
import { apiRequest } from "./api"

export const ROOM_UPDATED_EVENT = "cay-phuong-rooms-updated"

function emitRoomUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ROOM_UPDATED_EVENT))
  }
}

type BackendRoom = {
  id: number | string
  code?: string | null
  name: string
  type?: string | null
  description: string
  price: number | string
  status: string
  capacity: number
  image?: string | null
  secondaryImage?: string | null
  secondary_image?: string | null
}

export type RoomPayload = {
  code: string
  name: string
  type: string
  price: number
  status: RoomStatus
  capacity: number
  description: string
  primaryImage?: string
  secondaryImages?: string[]
}

function normalizeStatus(status: string): RoomStatus {
  const normalized = status.trim().toUpperCase()

  if (
    normalized === "AVAILABLE" ||
    status === "Đang hoạt động" ||
    status === "DANG_HOAT_DONG"
  ) {
    return "AVAILABLE"
  }

  return "UNAVAILABLE"
}

/**
 * Backend hiện có 2 field LONGTEXT:
 * - image: ảnh chính
 * - secondaryImage: ảnh phụ
 *
 * Không đổi backend: khi có nhiều ảnh phụ, frontend lưu chúng vào
 * secondaryImage dưới dạng JSON string. Dữ liệu cũ chỉ có 1 ảnh phụ
 * dạng string vẫn đọc được bình thường.
 */
function parseSecondaryImages(value?: string | null): string[] {
  const normalized = value?.trim()
  if (!normalized) return []

  if (normalized.startsWith("[")) {
    try {
      const parsed = JSON.parse(normalized) as unknown

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 4)
      }
    } catch {
      // Nếu không phải JSON hợp lệ thì xử lý như dữ liệu cũ bên dưới.
    }
  }

  return [normalized]
}

function serializeSecondaryImages(images: string[]): string {
  const cleaned = Array.from(
    new Set(images.map((image) => image.trim()).filter(Boolean)),
  ).slice(0, 4)

  if (cleaned.length === 0) return ""

  // Giữ tương thích dữ liệu cũ: 1 ảnh phụ vẫn lưu trực tiếp dưới dạng string.
  if (cleaned.length === 1) return cleaned[0]

  return JSON.stringify(cleaned)
}

function normalizeRoom(room: BackendRoom): RoomPrototype {
  const secondaryValue = room.secondaryImage ?? room.secondary_image

  const images = Array.from(
    new Set(
      [
        room.image?.trim() || "",
        ...parseSecondaryImages(secondaryValue),
      ].filter(Boolean),
    ),
  ).slice(0, 5)

  return {
    id: Number(room.id),
    code: room.code?.trim() || `P${String(room.id).padStart(3, "0")}`,
    name: room.name,
    type: room.type?.trim() || "Standard",
    price: Number(room.price),
    status: normalizeStatus(room.status),
    capacity: Number(room.capacity),
    description: room.description,
    images,
  }
}

function toBackendPayload(room: Partial<RoomPayload>) {
  const payload: Record<string, unknown> = {}

  if (room.code !== undefined) payload.code = room.code
  if (room.name !== undefined) payload.name = room.name
  if (room.type !== undefined) payload.type = room.type
  if (room.description !== undefined) payload.description = room.description
  if (room.price !== undefined) payload.price = room.price
  if (room.status !== undefined) payload.status = room.status
  if (room.capacity !== undefined) payload.capacity = room.capacity

  if (room.primaryImage !== undefined) {
    payload.image = room.primaryImage
  }

  if (room.secondaryImages !== undefined) {
    payload.secondaryImage = serializeSecondaryImages(room.secondaryImages)
  }

  return payload
}

export async function getRooms(): Promise<RoomPrototype[]> {
  const rooms = await apiRequest<BackendRoom[]>("/api/v1/rooms")
  return rooms.map(normalizeRoom)
}

export async function getPublicRooms(): Promise<RoomPrototype[]> {
  const rooms = await getRooms()
  return rooms.filter((room) => room.status === "AVAILABLE")
}

export async function getRoomById(id: number | string): Promise<RoomPrototype> {
  const room = await apiRequest<BackendRoom>(`/api/v1/rooms/${id}`)
  return normalizeRoom(room)
}

export async function createRoom(room: RoomPayload): Promise<RoomPrototype> {
  const created = await apiRequest<BackendRoom>("/api/v1/rooms", {
    method: "POST",
    body: JSON.stringify(toBackendPayload(room)),
  })

  emitRoomUpdated()
  return normalizeRoom(created)
}

export async function updateRoom(
  id: number | string,
  room: Partial<RoomPayload>,
): Promise<RoomPrototype> {
  const updated = await apiRequest<BackendRoom>(`/api/v1/rooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toBackendPayload(room)),
  })

  emitRoomUpdated()
  return normalizeRoom(updated)
}

export async function deleteRoom(id: number | string): Promise<void> {
  await apiRequest<{ message: string }>(`/api/v1/rooms/${id}`, {
    method: "DELETE",
  })
  emitRoomUpdated()
}
