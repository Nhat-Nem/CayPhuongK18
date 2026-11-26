import { apiRequest } from "./api"

export type PromotionApplyType = 1 | 2

export interface PromotionRecord {
  id: string
  name: string
  discountPercent: number
  startDate: string
  endDate: string
  applyType: PromotionApplyType
  image: string | null
  backendStatus: "ACTIVE" | "INACTIVE"
  /** Kiểu giảm giá từ backend; trang quản lý ưu đãi hiện chỉ tạo PERCENTAGE. */
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT"
}

type BackendPromotion = {
  id: string | number
  name: string
  description?: string | null
  image?: string | null
  discountType: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue: string | number
  appliesTo: "HOTEL" | "RESTAURANT"
  startDate: string
  endDate: string
  status?: "ACTIVE" | "INACTIVE" | string
  createdAt?: string
  updatedAt?: string
}

const API_PATH = "/api/v1/promotions"

// Đọc ngày theo giờ máy người dùng: 00:00 giờ VN được backend trả về là 17:00 UTC hôm trước.
function dateOnly(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value ?? "").slice(0, 10)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function normalizePromotion(row: BackendPromotion): PromotionRecord {
  return {
    id: String(row.id),
    name: String(row.name ?? "").trim(),
    discountPercent: Number(row.discountValue) || 0,
    startDate: dateOnly(row.startDate),
    endDate: dateOnly(row.endDate),
    applyType: row.appliesTo === "HOTEL" ? 1 : 2,
    image: row.image ?? null,
    backendStatus: row.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    discountType: row.discountType,
  }
}

function toBackendPayload(payload: Omit<PromotionRecord, "id" | "backendStatus">) {
  return {
    name: payload.name.trim(),
    discountType: "PERCENTAGE" as const,
    discountValue: payload.discountPercent,
    appliesTo: payload.applyType === 1 ? ("HOTEL" as const) : ("RESTAURANT" as const),
    // Gửi kèm giờ Việt Nam để ưu đãi chạy trọn ngày bắt đầu và ngày kết thúc.
    startDate: `${payload.startDate}T00:00:00+07:00`,
    endDate: `${payload.endDate}T23:59:59+07:00`,
    image: payload.image?.trim() ?? "",
    status: "ACTIVE" as const,
  }
}

export async function getPromotions(): Promise<PromotionRecord[]> {
  const rows = await apiRequest<BackendPromotion[]>(API_PATH)
  return rows.map(normalizePromotion)
}

export async function createPromotion(
  payload: Omit<PromotionRecord, "id" | "backendStatus">,
) {
  const row = await apiRequest<BackendPromotion>(API_PATH, {
    method: "POST",
    body: JSON.stringify(toBackendPayload(payload)),
  })
  return normalizePromotion(row)
}

export async function updatePromotion(
  id: string,
  payload: Omit<PromotionRecord, "id" | "backendStatus">,
) {
  const row = await apiRequest<BackendPromotion>(
    `${API_PATH}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(toBackendPayload(payload)),
    },
  )
  return normalizePromotion(row)
}

export async function deletePromotion(id: string) {
  await apiRequest<{ message?: string }>(
    `${API_PATH}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )
}

export async function getPromotionById(id: string) {
  const row = await apiRequest<BackendPromotion>(
    `${API_PATH}/${encodeURIComponent(id)}`,
  )
  return normalizePromotion(row)
}

export function promotionApplyTypeLabel(type: PromotionApplyType) {
  return type === 1 ? "Khách sạn" : "Nhà hàng"
}


export function formatPromotionDate(value: string) {
  const normalized = dateOnly(value)
  const [year, month, day] = normalized.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export function promotionStatus(item: PromotionRecord) {
  if (item.backendStatus === "INACTIVE") return "ended" as const

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(`${item.startDate}T00:00:00`)
  const end = new Date(`${item.endDate}T23:59:59`)

  if (today < start) return "upcoming" as const
  if (today > end) return "ended" as const
  return "active" as const
}

export function promotionStatusLabel(item: PromotionRecord) {
  if (item.backendStatus === "INACTIVE") return "Đã tắt"

  const status = promotionStatus(item)
  if (status === "active") return "Đang áp dụng"
  if (status === "upcoming") return "Sắp diễn ra"
  return "Đã kết thúc"
}

export async function getCustomerPromotions() {
  const rows = await getPromotions()
  return rows.filter(
    (item) => item.backendStatus === "ACTIVE" && promotionStatus(item) !== "ended",
  )
}
