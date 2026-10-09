import { apiRequest } from "./api"

export type ServiceType = "Phòng nghỉ" | "Nhà hàng"
export type GuestStatus = "Chờ tiếp nhận" | "Đang phục vụ" | "Hoàn tất"

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

export function getWalkIns() {
  return apiRequest<WalkInRecord[]>("/walk-ins")
}

export function createWalkIn(payload: CreateWalkInPayload) {
  return apiRequest<WalkInRecord>("/walk-ins", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateWalkIn(id: number, payload: Partial<CreateWalkInPayload & { status: GuestStatus }>) {
  return apiRequest<WalkInRecord>(`/walk-ins/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export async function deleteWalkIn(id: number) {
  await apiRequest<{ message: string }>(`/walk-ins/${id}`, { method: "DELETE" })
}
