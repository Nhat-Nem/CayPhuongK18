import type { MenuDish } from "@/services/menuStore"

const STORAGE_KEY = "cay-phuong-sprint5-order-prototype"

export type OrderItemRecord = {
  id: string
  menuItemId: string
  name: string
  image: string
  unitPrice: number
  quantity: number
}

export type OrderRecord = {
  id: string
  customerName: string
  tableNumber: string
  note: string
  items: OrderItemRecord[]
  createdAt: string
  updatedAt: string
}

export type OrderFormPayload = {
  customerName: string
  tableNumber: string
  note: string
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage)
}

function readRows(): OrderRecord[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed as OrderRecord[]
  } catch {
    return []
  }
}

function writeRows(rows: OrderRecord[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

function newestFirst(rows: OrderRecord[]) {
  return [...rows].sort((a, b) => {
    const aTime = Date.parse(a.createdAt)
    const bTime = Date.parse(b.createdAt)
    if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
      return bTime - aTime
    }
    return b.id.localeCompare(a.id, undefined, { numeric: true })
  })
}

function orderId() {
  return String(Date.now())
}

function orderItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getPrototypeOrders() {
  return newestFirst(readRows())
}

export function getPrototypeOrderById(id: string) {
  return readRows().find((row) => row.id === id)
}

export function createPrototypeOrder(payload: OrderFormPayload) {
  const now = new Date().toISOString()

  const created: OrderRecord = {
    id: orderId(),
    customerName: payload.customerName.trim(),
    tableNumber: payload.tableNumber.trim(),
    note: payload.note.trim(),
    items: [],
    createdAt: now,
    updatedAt: now,
  }

  const next = newestFirst([created, ...readRows()])
  writeRows(next)
  return created
}

export function updatePrototypeOrder(id: string, payload: OrderFormPayload) {
  let updated: OrderRecord | undefined

  const next = readRows().map((row) => {
    if (row.id !== id) return row

    updated = {
      ...row,
      customerName: payload.customerName.trim(),
      tableNumber: payload.tableNumber.trim(),
      note: payload.note.trim(),
      updatedAt: new Date().toISOString(),
    }

    return updated
  })

  writeRows(newestFirst(next))
  return updated
}

export function addPrototypeOrderItem(
  orderIdValue: string,
  dish: MenuDish,
) {
  let updated: OrderRecord | undefined

  const next = readRows().map((row) => {
    if (row.id !== orderIdValue) return row

    const existing = row.items.find((item) => item.menuItemId === dish.id)

    const items = existing
      ? row.items.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      : [
          ...row.items,
          {
            id: orderItemId(),
            menuItemId: dish.id,
            name: dish.name,
            image: dish.image,
            unitPrice: dish.priceValue,
            quantity: 1,
          },
        ]

    updated = {
      ...row,
      items,
      updatedAt: new Date().toISOString(),
    }

    return updated
  })

  writeRows(newestFirst(next))
  return updated
}

export function updatePrototypeOrderItemQuantity(
  orderIdValue: string,
  itemId: string,
  quantity: number,
) {
  if (quantity < 1) return getPrototypeOrderById(orderIdValue)

  let updated: OrderRecord | undefined

  const next = readRows().map((row) => {
    if (row.id !== orderIdValue) return row

    updated = {
      ...row,
      items: row.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
      updatedAt: new Date().toISOString(),
    }

    return updated
  })

  writeRows(newestFirst(next))
  return updated
}

export function removePrototypeOrderItem(
  orderIdValue: string,
  itemId: string,
) {
  let updated: OrderRecord | undefined

  const next = readRows().map((row) => {
    if (row.id !== orderIdValue) return row

    updated = {
      ...row,
      items: row.items.filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    }

    return updated
  })

  writeRows(newestFirst(next))
  return updated
}

export function calculatePrototypeOrderTotal(order: OrderRecord) {
  return order.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  )
}
