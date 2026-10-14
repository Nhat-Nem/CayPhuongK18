import { apiRequest } from "@/services/api"

export type ServiceType = "Phòng nghỉ" | "Nhà hàng"
export type GuestStatus = "Chờ tiếp nhận" | "Đang phục vụ" | "Hoàn tất"

type WalkInServiceApi = "ROOM" | "RESTAURANT"
type WalkInStatusApi = "WAITING" | "SERVING" | "COMPLETED"

interface WalkInApiRecord {
  id: number | string
  code: string | null
  fullName: string
  phone: string
  service: WalkInServiceApi
  guests: number
  roomId: number | string | null
  note: string | null
  status: WalkInStatusApi
  createdAt: string
  updatedAt: string
}

export interface WalkInRecord {
  id: number
  code: string
  fullName: string
  phone: string
  service: ServiceType
  guests: number
  roomId: number | null
  note: string | null
  status: GuestStatus
  createdAt: string
}

export interface CreateWalkInPayload {
  fullName: string
  phone: string
  service: ServiceType
  guests: number
  roomId?: number | null
  note?: string
}

const serviceToApi: Record<ServiceType, WalkInServiceApi> = {
  "Phòng nghỉ": "ROOM",
  "Nhà hàng": "RESTAURANT",
}

const serviceFromApi: Record<WalkInServiceApi, ServiceType> = {
  ROOM: "Phòng nghỉ",
  RESTAURANT: "Nhà hàng",
}

const statusToApi: Record<GuestStatus, WalkInStatusApi> = {
  "Chờ tiếp nhận": "WAITING",
  "Đang phục vụ": "SERVING",
  "Hoàn tất": "COMPLETED",
}

const statusFromApi: Record<WalkInStatusApi, GuestStatus> = {
  WAITING: "Chờ tiếp nhận",
  SERVING: "Đang phục vụ",
  COMPLETED: "Hoàn tất",
}

function mapRecord(row: WalkInApiRecord): WalkInRecord {
  return {
    id: Number(row.id),
    code: row.code || `VL-${String(row.id).padStart(6, "0")}`,
    fullName: row.fullName,
    phone: row.phone,
    service: serviceFromApi[row.service],
    guests: Number(row.guests),
    roomId: row.roomId === null ? null : Number(row.roomId),
    note: row.note,
    status: statusFromApi[row.status],
    createdAt: row.createdAt,
  }
}

export async function getWalkIns(): Promise<WalkInRecord[]> {
  const rows = await apiRequest<WalkInApiRecord[]>("/api/v1/walk-ins")
  return rows.map(mapRecord)
}

export async function createWalkIn(
  payload: CreateWalkInPayload,
): Promise<WalkInRecord> {
  const service = serviceToApi[payload.service]

  const row = await apiRequest<WalkInApiRecord>("/api/v1/walk-ins", {
    method: "POST",
    body: JSON.stringify({
      fullName: payload.fullName.trim(),
      phone: payload.phone.trim(),
      service,
      guests: payload.guests,
      ...(service === "ROOM" && payload.roomId
        ? { roomId: Number(payload.roomId) }
        : {}),
      ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
    }),
  })

  return mapRecord(row)
}

export async function updateWalkIn(
  id: number,
  payload: Partial<CreateWalkInPayload & { status: GuestStatus }>,
): Promise<WalkInRecord> {
  const body: Record<string, unknown> = {}

  if (payload.status) body.status = statusToApi[payload.status]
  if (payload.fullName !== undefined) body.fullName = payload.fullName.trim()
  if (payload.phone !== undefined) body.phone = payload.phone.trim()
  if (payload.service !== undefined) body.service = serviceToApi[payload.service]
  if (payload.guests !== undefined) body.guests = payload.guests
  if (payload.roomId !== undefined) body.roomId = payload.roomId
  if (payload.note !== undefined) body.note = payload.note.trim() || null

  const row = await apiRequest<WalkInApiRecord>(`/api/v1/walk-ins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })

  return mapRecord(row)
}

export async function deleteWalkIn(id: number): Promise<void> {
  await apiRequest(`/api/v1/walk-ins/${id}`, {
    method: "DELETE",
  })
}
