import { apiRequest } from "./api"

export interface CreateTableBookingPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  note?: string
}

export interface CreateReviewPayload {
  customerName: string
  customerPhone: string
  customerEmail?: string
  rating: number
  note?: string
}

type CreatedRequest = {
  id?: string | number
}

export function createTableBookingRequest(payload: CreateTableBookingPayload) {
  return apiRequest<CreatedRequest>("/api/v1/table-booking-requests", {
    method: "POST",
    body: JSON.stringify({
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail || undefined,
      note: payload.note || undefined,
    }),
  })
}

export function createReview(payload: CreateReviewPayload) {
  return apiRequest<CreatedRequest>("/api/v1/reviews", {
    method: "POST",
    body: JSON.stringify({
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail || undefined,
      rating: payload.rating,
      note: payload.note || undefined,
    }),
  })
}
