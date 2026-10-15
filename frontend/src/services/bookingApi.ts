import { apiRequest } from "./api"

export interface CreateBookRequestPayload {
  fullName: string
  phone: string
  email: string
  checkIn: string
  checkOut: string
  guests: number
  roomId: number
  note?: string
}

type BackendBookRequest = {
  id: number | string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  note?: string | null
  status: string
  created_at: string
}

export interface BookRequestRecord extends CreateBookRequestPayload {
  id: number
  code: string
  status: string
  createdAt: string
}

function buildBackendNote(payload: CreateBookRequestPayload) {
  const lines = [
    `Room ID: ${payload.roomId}`,
    `Check-in: ${payload.checkIn}`,
    `Check-out: ${payload.checkOut}`,
    `Guests: ${payload.guests}`,
  ]

  if (payload.note?.trim()) {
    lines.push(`Customer note: ${payload.note.trim()}`)
  }

  return lines.join("\n")
}

/**
 * Backend hiện tại lưu customer_name / customer_phone / customer_email / note.
 * Các thông tin lưu trú được đóng gói trong note để không phải thay đổi backend
 * quá nhiều trong Sprint 2.
 */
export async function createBookRequest(
  payload: CreateBookRequestPayload,
): Promise<BookRequestRecord> {
  const created = await apiRequest<BackendBookRequest>(
    "/api/v1/book-requests",
    {
      method: "POST",
      body: JSON.stringify({
        customer_name: payload.fullName,
        customer_phone: payload.phone,
        customer_email: payload.email || undefined,
        note: buildBackendNote(payload),
      }),
    },
  )

  const id = Number(created.id)

  return {
    ...payload,
    id,
    code: `DP-${String(id).padStart(6, "0")}`,
    status: created.status,
    createdAt: created.created_at,
  }
}
