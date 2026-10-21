import { apiRequest } from "./api"

export type OrderRole = "ADMIN" | "STAFF"

export type OrderUser = {
  id: string
  username?: string
  email: string
  full_name: string
  role: OrderRole
}

export type OrderMenuItem = {
  id: string
  name: string
  image?: string | null
  categoryId?: string | null
}

export type OrderItemRecord = {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: number
  subtotal: number
  menuItem: OrderMenuItem | null
}

export type OrderRecord = {
  id: string
  customerName: string | null
  tableNumber: string | null
  note: string | null
  createdById: string
  createdBy: OrderUser | null
  items: OrderItemRecord[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export type OrderPayload = {
  customerName?: string
  tableNumber?: string
  note?: string
}

const ORDERS_API_PATH = "/api/v1/orders"

export async function getOrders() {
  return apiRequest<OrderRecord[]>(ORDERS_API_PATH)
}

export async function getOrderById(id: string) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeURIComponent(id)}`,
  )
}

export async function createOrder(payload: OrderPayload) {
  return apiRequest<OrderRecord>(ORDERS_API_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateOrder(id: string, payload: OrderPayload) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  )
}

export async function addOrderItem(
  orderId: string,
  menuItemId: string,
  quantity = 1,
) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeURIComponent(orderId)}/items`,
    {
      method: "POST",
      body: JSON.stringify({
        menuItemId: Number(menuItemId),
        quantity,
      }),
    },
  )
}

export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  quantity: number,
) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  )
}

export async function removeOrderItem(orderId: string, itemId: string) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}`,
    { method: "DELETE" },
  )
}
