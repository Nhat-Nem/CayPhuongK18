import { apiRequest } from "@/services/api"

export type RoomStayPaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER"

export type RoomStayRecord = {
  id: string | number
  roomId: string | number
  bookingRequestId: string | number | null
  walkInVisitId: string | number | null
  room?: {
    id?: string | number
    code?: string | null
    name?: string | null
  } | null
  checkInAt: string
  checkOutAt: string | null
  roomPrice: string | number
  totalAmount: string | number
  paymentStatus: "PAID" | "UNPAID" | string
  paymentMethod: RoomStayPaymentMethod | null
  status: "CHECKED_IN" | "CHECKED_OUT" | string
  paidAt: string | null
  createdAt: string
}

export function getRoomStays() {
  return apiRequest<RoomStayRecord[]>("/api/v1/room-stays")
}

export type CheckInRoomStayPayload =
  | { roomId: string; bookingRequestId: string }
  | { roomId: string; walkInVisitId: string }

export function checkInRoomStay(payload: CheckInRoomStayPayload) {
  return apiRequest<RoomStayRecord>("/api/v1/room-stays", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function checkOutRoomStay(
  id: string | number,
  paymentMethod: RoomStayPaymentMethod,
) {
  return apiRequest<RoomStayRecord>(
    `/api/v1/room-stays/${encodeURIComponent(String(id))}/checkout`,
    {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    },
  )
}
