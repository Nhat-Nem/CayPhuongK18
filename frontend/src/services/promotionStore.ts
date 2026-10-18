export type PromotionApplyType = 1 | 2

export interface PromotionRecord {
  id: string
  name: string
  discountPercent: number
  startDate: string
  endDate: string
  applyType: PromotionApplyType
}

const STORAGE_KEY = "cayphuongk18_promotions_v1"

const defaultPromotions: PromotionRecord[] = [
  {
    id: "promo-hotel-20",
    name: "Ưu đãi lưu trú cuối năm",
    discountPercent: 20,
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    applyType: 1,
  },
  {
    id: "promo-food-15",
    name: "Ưu đãi ẩm thực gia đình",
    discountPercent: 15,
    startDate: "2026-10-15",
    endDate: "2026-11-30",
    applyType: 2,
  },
]

function normalizePromotion(item: Partial<PromotionRecord>): PromotionRecord | null {
  const applyType = Number(item.applyType)
  const discountPercent = Number(item.discountPercent)

  if (!item.id || !item.name) return null
  if (applyType !== 1 && applyType !== 2) return null
  if (!Number.isFinite(discountPercent)) return null

  return {
    id: String(item.id),
    name: String(item.name).trim(),
    discountPercent,
    startDate: String(item.startDate ?? ""),
    endDate: String(item.endDate ?? ""),
    applyType: applyType as PromotionApplyType,
  }
}

function write(items: PromotionRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getPromotions(): PromotionRecord[] {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    write(defaultPromotions)
    return [...defaultPromotions]
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizePromotion(item))
      .filter((item): item is PromotionRecord => Boolean(item))
  } catch {
    return []
  }
}

export function createPromotion(payload: Omit<PromotionRecord, "id">) {
  const item: PromotionRecord = {
    ...payload,
    id: `promo-${Date.now()}`,
  }
  const next = [item, ...getPromotions()]
  write(next)
  return item
}

export function updatePromotion(id: string, payload: Omit<PromotionRecord, "id">) {
  const next = getPromotions().map((item) =>
    item.id === id ? { ...payload, id } : item,
  )
  write(next)
}

export function deletePromotion(id: string) {
  write(getPromotions().filter((item) => item.id !== id))
}

export function getPromotionById(id: string) {
  return getPromotions().find((item) => item.id === id) ?? null
}

export function promotionApplyTypeLabel(type: PromotionApplyType) {
  return type === 1 ? "Khách sạn" : "Nhà hàng"
}

export function promotionImage(type: PromotionApplyType) {
  return type === 1 ? "dd726.png" : "38458.png"
}

export function formatPromotionDate(value: string) {
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export function promotionStatus(item: PromotionRecord) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(`${item.startDate}T00:00:00`)
  const end = new Date(`${item.endDate}T23:59:59`)

  if (today < start) return "upcoming" as const
  if (today > end) return "ended" as const
  return "active" as const
}

export function promotionStatusLabel(item: PromotionRecord) {
  const status = promotionStatus(item)
  if (status === "active") return "Đang áp dụng"
  if (status === "upcoming") return "Sắp diễn ra"
  return "Đã kết thúc"
}

export function getCustomerPromotions() {
  return getPromotions().filter((item) => promotionStatus(item) !== "ended")
}
