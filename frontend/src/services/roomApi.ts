import type { RoomPrototype, RoomStatus } from "@/data/roomPrototype"
import { apiRequest } from "./api"

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
  secondaryImage?: string
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

function normalizeRoom(room: BackendRoom): RoomPrototype {
  const secondaryImage = room.secondaryImage ?? room.secondary_image
  return {
    id: Number(room.id),
    code: room.code?.trim() || `P${String(room.id).padStart(3, "0")}`,
    name: room.name,
    type: room.type?.trim() || "Standard",
    price: Number(room.price),
    status: normalizeStatus(room.status),
    capacity: Number(room.capacity),
    description: room.description,
    images: [
      room.image || "8bb71.png",
      secondaryImage || room.image || "a0b15.png",
    ],
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
    payload.image = room.primaryImage || null
  }

  if (room.secondaryImage !== undefined) {
    payload.secondaryImage = room.secondaryImage || null
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
  return normalizeRoom(updated)
}

export async function deleteRoom(id: number | string): Promise<void> {
  await apiRequest<{ message: string }>(`/api/v1/rooms/${id}`, {
    method: "DELETE",
  })
}
