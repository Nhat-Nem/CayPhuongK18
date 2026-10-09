import type { RoomPrototype } from "@/data/roomPrototype"
import { apiRequest } from "./api"

type BackendRoom = {
  id: number | string
  code?: string
  name: string
  type?: string
  description: string
  price: number | string
  status: string
  capacity: number
  bed?: string
  view?: string
  image?: string | null
  secondaryImage?: string | null
}

export type RoomPayload = Omit<RoomPrototype, "id" | "images"> & {
  primaryImage?: string
  secondaryImage?: string
}

function normalizeRoom(room: BackendRoom): RoomPrototype {
  return {
    id: Number(room.id),
    code: room.code || `P${String(room.id).padStart(3, "0")}`,
    name: room.name,
    type: room.type || "Standard",
    price: Number(room.price),
    status: room.status === "Tạm ngưng" ? "Tạm ngưng" : "Đang hoạt động",
    capacity: Number(room.capacity),
    bed: room.bed || "—",
    view: room.view || "—",
    description: room.description,
    images: [room.image || "8bb71.png", room.secondaryImage || room.image || "a0b15.png"],
  }
}

function toBackendPayload(room: RoomPayload) {
  return {
    code: room.code,
    name: room.name,
    type: room.type,
    description: room.description,
    price: room.price,
    status: room.status,
    capacity: room.capacity,
    bed: room.bed,
    view: room.view,
    image: room.primaryImage || null,
    secondaryImage: room.secondaryImage || null,
  }
}

export async function getRooms(): Promise<RoomPrototype[]> {
  const rooms = await apiRequest<BackendRoom[]>("/rooms")
  return rooms.map(normalizeRoom)
}

export async function getPublicRooms(): Promise<RoomPrototype[]> {
  const rooms = await getRooms()
  return rooms.filter((room) => room.status === "Đang hoạt động")
}

export async function getRoomById(id: number | string): Promise<RoomPrototype> {
  const room = await apiRequest<BackendRoom>(`/rooms/${id}`)
  return normalizeRoom(room)
}

export async function createRoom(room: RoomPayload): Promise<RoomPrototype> {
  const created = await apiRequest<BackendRoom>("/rooms", {
    method: "POST",
    body: JSON.stringify(toBackendPayload(room)),
  })
  return normalizeRoom(created)
}

export async function updateRoom(id: number | string, room: Partial<RoomPayload>): Promise<RoomPrototype> {
  const payload: Record<string, unknown> = { ...room }
  if ("primaryImage" in room) {
    payload.image = room.primaryImage || null
    delete payload.primaryImage
  }
  if ("secondaryImage" in room) payload.secondaryImage = room.secondaryImage || null

  const updated = await apiRequest<BackendRoom>(`/rooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
  return normalizeRoom(updated)
}

export async function deleteRoom(id: number | string): Promise<void> {
  await apiRequest<{ message: string }>(`/rooms/${id}`, { method: "DELETE" })
}
