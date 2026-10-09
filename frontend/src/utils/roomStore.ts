import { roomPrototypeData, type RoomPrototype } from "@/data/roomPrototype"

const ROOM_STORAGE_KEY = "cay-phuong-rooms"
export const ROOM_UPDATED_EVENT = "cay-phuong-rooms-updated"

const cloneSeedRooms = () => roomPrototypeData.map((room) => ({ ...room, images: [...room.images] as [string, string] }))

export function getRooms(): RoomPrototype[] {
  try {
    const saved = window.localStorage.getItem(ROOM_STORAGE_KEY)
    if (!saved) return cloneSeedRooms()
    const parsed = JSON.parse(saved) as RoomPrototype[]
    return Array.isArray(parsed) ? parsed : cloneSeedRooms()
  } catch {
    return cloneSeedRooms()
  }
}

export function getPublicRooms(): RoomPrototype[] {
  return getRooms().filter((room) => room.status === "Đang hoạt động")
}

export function getRoomById(id: string | null): RoomPrototype | undefined {
  if (!id) return undefined
  return getRooms().find((room) => room.id === id)
}

export function saveRooms(rooms: RoomPrototype[]) {
  window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(rooms))
  window.dispatchEvent(new CustomEvent(ROOM_UPDATED_EVENT))
}

export function addRoom(room: RoomPrototype) {
  const rooms = getRooms()
  saveRooms([room, ...rooms])
}

export function updateRoom(room: RoomPrototype) {
  const rooms = getRooms()
  saveRooms(rooms.map((item) => (item.id === room.id ? room : item)))
}

export function deleteRoom(id: string) {
  saveRooms(getRooms().filter((room) => room.id !== id))
}

export function isRoomCodeTaken(code: string, ignoreId?: string) {
  const normalized = code.trim().toLocaleLowerCase("vi")
  return getRooms().some(
    (room) => room.id !== ignoreId && room.code.trim().toLocaleLowerCase("vi") === normalized,
  )
}
