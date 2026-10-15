import { apiRequest } from "@/services/api"

export type ServiceType = "Phòng nghỉ" | "Nhà hàng"
export type GuestStatus = "Chờ tiếp nhận" | "Đang phục vụ" | "Hoàn tất"

type WalkInServiceApi = "ROOM" | "RESTAURANT"
type WalkInStatusApi = "PENDING" | "SERVING" | "COMPLETED"

interface WalkInApiRecord {
  id: number | string
  customerName: string
  customerPhone: string
  serviceType: WalkInServiceApi
  guestCount: number
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
  "Chờ tiếp nhận": "PENDING",
  "Đang phục vụ": "SERVING",
  "Hoàn tất": "COMPLETED",
}

const statusFromApi: Record<WalkInStatusApi, GuestStatus> = {
  PENDING: "Chờ tiếp nhận",
  SERVING: "Đang phục vụ",
  COMPLETED: "Hoàn tất",
}

function mapRecord(row: WalkInApiRecord): WalkInRecord {
  return {
    id: Number(row.id),
    // Backend walk_in_visits không có cột code.
    // Frontend tạo mã hiển thị từ id, không thay đổi database.
    code: `VL-${String(row.id).padStart(6, "0")}`,
    fullName: row.customerName,
    phone: row.customerPhone,
    service: serviceFromApi[row.serviceType],
    guests: Number(row.guestCount),
    roomId: row.roomId === null ? null : Number(row.roomId),
    note: row.note,
    status: statusFromApi[row.status],
    createdAt: row.createdAt,
  }
}

export async function getWalkIns(): Promise<WalkInRecord[]> {
  const rows = await apiRequest<WalkInApiRecord[]>(
    "/api/v1/walk-in-visits",
  )

  return rows.map(mapRecord)
}

export async function createWalkIn(
  payload: CreateWalkInPayload,
): Promise<WalkInRecord> {
  const serviceType = serviceToApi[payload.service]

  const row = await apiRequest<WalkInApiRecord>(
    "/api/v1/walk-in-visits",
    {
      method: "POST",
      body: JSON.stringify({
        customerName: payload.fullName.trim(),
        customerPhone: payload.phone.trim(),
        serviceType,
        guestCount: payload.guests,

        // DTO backend dùng @IsString cho roomId.
        ...(serviceType === "ROOM" && payload.roomId
          ? { roomId: String(payload.roomId) }
          : {}),

        ...(payload.note?.trim()
          ? { note: payload.note.trim() }
          : {}),
      }),
    },
  )

  return mapRecord(row)
}

export async function updateWalkIn(
  id: number,
  payload: { status: GuestStatus },
): Promise<WalkInRecord> {
  // Controller backend PATCH chỉ hỗ trợ body { status?: string }.
  const row = await apiRequest<WalkInApiRecord>(
    `/api/v1/walk-in-visits/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: statusToApi[payload.status],
      }),
    },
  )

  return mapRecord(row)
}

export async function deleteWalkIn(id: number): Promise<void> {
  await apiRequest<{ message: string }>(
    `/api/v1/walk-in-visits/${id}`,
    {
      method: "DELETE",
    },
  )
}
