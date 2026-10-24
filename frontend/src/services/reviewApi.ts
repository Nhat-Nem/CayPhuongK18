import { apiRequest } from "./api"

export type ReviewRecord = {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  rating: number
  note: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Lấy danh sách đánh giá từ API hiện tại của backend:
 * GET /api/v1/reviews
 */
export function getReviews(): Promise<ReviewRecord[]> {
  return apiRequest<ReviewRecord[]>("/api/v1/reviews")
}
