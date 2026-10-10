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

const STORAGE_KEY = "cay-phuong-walk-ins-sprint2"

function readRows(): WalkInRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WalkInRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRows(rows: WalkInRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

/**
 * US.08 hiện mới là phần frontend của Sprint 2.
 * Backend nhóm chưa có module walk-ins nên tạm lưu localStorage để tránh gọi API
 * không tồn tại và gây 404. Khi backend có endpoint, chỉ cần thay file service này.
 */
export async function getWalkIns() {
  return readRows()
}

export async function createWalkIn(payload: CreateWalkInPayload) {
  const rows = readRows()
  const id = Date.now()

  const row: WalkInRecord = {
    id,
    code: `VL-${String(id).slice(-6)}`,
    fullName: payload.fullName,
    phone: payload.phone,
    service: payload.service,
    guests: payload.guests,
    roomId: payload.roomId ?? null,
    note: payload.note?.trim() || null,
    status: "Chờ tiếp nhận",
    createdAt: new Date().toISOString(),
  }

  writeRows([row, ...rows])
  return row
}

export async function updateWalkIn(
  id: number,
  payload: Partial<CreateWalkInPayload & { status: GuestStatus }>,
) {
  const rows = readRows()
  const index = rows.findIndex((row) => row.id === id)

  if (index < 0) {
    throw new Error("Không tìm thấy lượt khách vãng lai.")
  }

  const next = {
    ...rows[index],
    ...payload,
    roomId:
      payload.roomId === undefined ? rows[index].roomId : payload.roomId ?? null,
    note:
      payload.note === undefined
        ? rows[index].note
        : payload.note.trim() || null,
  }

  const updatedRows = [...rows]
  updatedRows[index] = next
  writeRows(updatedRows)
  return next
}

export async function deleteWalkIn(id: number) {
  writeRows(readRows().filter((row) => row.id !== id))
}
