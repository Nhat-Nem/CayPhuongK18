import { apiRequest } from "./api"

export type ReviewRecord = {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  rating: number
  note: string | null
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export type UpdateReviewFeaturedPayload = {
  isFeatured: boolean
}

export const REVIEW_FEATURED_UPDATED_EVENT = "cay-phuong-featured-reviews-updated"

function encodeId(id: string | number) {
  // IDs BIGINT của MySQL phải giữ nguyên dạng chuỗi.
  return encodeURIComponent(String(id))
}

/** GET /api/v1/reviews — danh sách đánh giá mới nhất trước. */
export function getReviews(): Promise<ReviewRecord[]> {
  return apiRequest<ReviewRecord[]>("/api/v1/reviews")
}

/** GET /api/v1/reviews/featured — các đánh giá được phép hiển thị trên trang chủ. */
export function getFeaturedReviews(): Promise<ReviewRecord[]> {
  return apiRequest<ReviewRecord[]>("/api/v1/reviews/featured")
}

/** PATCH /api/v1/reviews/:id/featured — cập nhật trạng thái hiển thị. */
export function updateReviewFeatured(id: string, isFeatured: boolean) {
  return apiRequest<ReviewRecord>(`/api/v1/reviews/${encodeId(id)}/featured`, {
    method: "PATCH",
    body: JSON.stringify({ isFeatured } satisfies UpdateReviewFeaturedPayload),
  })
}

/** DELETE /api/v1/reviews/:id — xóa đánh giá khỏi cơ sở dữ liệu. */
export async function deleteReview(id: string): Promise<void> {
  await apiRequest<{ message?: string }>(`/api/v1/reviews/${encodeId(id)}`, {
    method: "DELETE",
  })
}
