import { apiRequest } from "./api"

export type RoomBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"

export interface CreateRoomBookingRequestPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  roomType: string
  guests: number
  checkIn: string
  checkOut: string
  note?: string
}

export interface RoomBookingRequestRecord {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  roomType: string
  guests: number | null
  checkIn: string
  checkOut: string
  note: string
  status: RoomBookingStatus
  createdAt: string
}

type BackendRoomBookingRequest = {
  id?: string | number
  customerName?: string
  customerPhone?: string
  customerEmail?: string | null
  roomType?: string
  guests?: number | string | null
  checkIn?: string
  checkOut?: string
  note?: string | null
  status?: string
  createdAt?: string
}

const GUEST_LINE = /^Số lượng khách:\s*(\d+)\s*$/im

function buildNote(guests: number, note?: string) {
  const lines = [`Số lượng khách: ${guests}`]
  if (note?.trim()) lines.push(note.trim())
  return lines.join("\n")
}

function normalizeStatus(value?: string): RoomBookingStatus {
  const normalized = String(value ?? "PENDING").trim().toUpperCase()

  if (normalized === "CONFIRMED") return "CONFIRMED"
  if (normalized === "COMPLETED") return "COMPLETED"
  if (normalized === "CANCELED" || normalized === "CANCELLED") {
    return "CANCELLED"
  }

  return "PENDING"
}

function normalizeRecord(
  row: BackendRoomBookingRequest,
): RoomBookingRequestRecord {
  const rawNote = String(row.note ?? "").trim()
  const guestFromNote = rawNote.match(GUEST_LINE)
  const guestsFromField = row.guests == null ? null : Number(row.guests)
  const guests = Number.isFinite(guestsFromField)
    ? guestsFromField
    : guestFromNote
      ? Number(guestFromNote[1])
      : null

  const note = rawNote
    .replace(GUEST_LINE, "")
    .replace(/^\s+|\s+$/g, "")

  return {
    id: String(row.id ?? ""),
    customerName: String(row.customerName ?? ""),
    customerPhone: String(row.customerPhone ?? ""),
    customerEmail: String(row.customerEmail ?? ""),
    roomType: String(row.roomType ?? ""),
    guests,
    checkIn: String(row.checkIn ?? ""),
    checkOut: String(row.checkOut ?? ""),
    note,
    status: normalizeStatus(row.status),
    createdAt: String(row.createdAt ?? ""),
  }
}

export async function createRoomBookingRequest(
  payload: CreateRoomBookingRequestPayload,
) {
  const response = await apiRequest<BackendRoomBookingRequest>(
    "/api/v1/room-booking-requests",
    {
      method: "POST",
      body: JSON.stringify({
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail || undefined,
        roomType: payload.roomType,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        note: buildNote(payload.guests, payload.note),
      }),
    },
  )

  return normalizeRecord(response)
}

export async function getRoomBookingRequests() {
  const response = await apiRequest<
    BackendRoomBookingRequest[] | { data?: BackendRoomBookingRequest[] }
  >("/api/v1/room-booking-requests")

  const rows = Array.isArray(response) ? response : response.data ?? []
  return rows.map(normalizeRecord)
}

export async function updateRoomBookingRequestStatus(
  id: string,
  status: RoomBookingStatus,
) {
  const response = await apiRequest<BackendRoomBookingRequest>(
    `/api/v1/room-booking-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  )

  return normalizeRecord(response)
}
