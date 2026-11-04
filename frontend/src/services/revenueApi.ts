import { apiRequest } from "./api"
import { getRoomStays, type RoomStayRecord } from "./roomStayApi"

export type FoodRevenueItem = {
  menuItemId: string | number
  menuItemName: string
  quantitySold: number
  revenue: string | number
}

export type FoodRevenueResponse = {
  from: string | null
  to: string | null
  totalRevenue: string | number
  items: FoodRevenueItem[]
}

export type RoomStayRevenueRecord = RoomStayRecord

/** GET /api/v1/reports/food-revenue — endpoint hiện tại chỉ dành cho ADMIN. */
export async function getFoodRevenueReport(from?: string, to?: string) {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)

  const query = params.toString()
  return apiRequest<FoodRevenueResponse>(
    `/api/v1/reports/food-revenue${query ? `?${query}` : ""}`,
  )
}

/** GET /api/v1/room-stays — dùng các lượt lưu trú đã thanh toán để tổng hợp doanh thu phòng. */
export async function getRoomStayRevenueRecords() {
  return getRoomStays()
}
