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

export interface BookRequestRecord extends CreateBookRequestPayload {
  id: number
  code: string
  status: string
  createdAt: string
}

export function createBookRequest(payload: CreateBookRequestPayload) {
  return apiRequest<BookRequestRecord>("/book-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
