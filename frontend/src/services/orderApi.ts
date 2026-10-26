import { apiRequest } from "./api"

export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
export type OrderPaymentStatus = "UNPAID" | "PAID"
export type OrderPaymentMethod = "CASH" | "BANK_TRANSFER" | "CARD"

export type OrderMenuItem = {
  id: string
  name: string
  image?: string | null
  categoryId?: string | null
}

/** Khớp với OrderItem entity của backend. Các ID BIGINT luôn giữ dạng string. */
export type OrderItemRecord = {
  id: string
  orderId: string
  menuItemId: string
  quantity: number
  unitPrice: string | number
  createdAt?: string
  menuItem: OrderMenuItem | null
}

/** Khớp với Order entity của backend hiện tại. */
export type OrderRecord = {
  id: string
  code: string
  note: string | null
  status: OrderStatus
  totalAmount: string | number
  paymentStatus: OrderPaymentStatus
  paymentMethod: OrderPaymentMethod | null
  paidAt: string | null
  createdBy: string | null
  items: OrderItemRecord[]
  createdAt: string
  updatedAt: string
}

/** Backend hiện chỉ nhận note khi tạo/cập nhật đơn. */
export type OrderPayload = {
  note?: string | null
}

const ORDERS_API_PATH = "/api/v1/orders"

function encodeId(id: string | number) {
  // ID BIGINT phải được giữ nguyên dạng chuỗi, tránh mất chính xác.
  return encodeURIComponent(String(id))
}

export async function getOrders() {
  return apiRequest<OrderRecord[]>(ORDERS_API_PATH)
}

export async function getOrderById(id: string) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}`)
}

export async function deleteOrder(id: string): Promise<void> {
  await apiRequest<{ message?: string }>(`${ORDERS_API_PATH}/${encodeId(id)}`, {
    method: "DELETE",
  })
}

export async function createOrder(payload: OrderPayload) {
  return apiRequest<OrderRecord>(ORDERS_API_PATH, {
    method: "POST",
    body: JSON.stringify({
      ...(payload.note !== undefined ? { note: payload.note } : {}),
    }),
  })
}

export async function updateOrder(id: string, payload: OrderPayload) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...(payload.note !== undefined ? { note: payload.note } : {}),
    }),
  })
}

export async function addOrderItem(
  orderId: string,
  menuItemId: string,
  quantity = 1,
) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(orderId)}/items`, {
    method: "POST",
    body: JSON.stringify({
      // AddOrderItemDto của backend khai báo @IsString() cho menuItemId.
      // Không chuyển ID BIGINT sang Number.
      menuItemId: String(menuItemId),
      quantity: Number(quantity),
    }),
  })
}

export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  quantity: number,
) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeId(orderId)}/items/${encodeId(itemId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity: Number(quantity) }),
    },
  )
}

export async function removeOrderItem(orderId: string, itemId: string) {
  return apiRequest<OrderRecord>(
    `${ORDERS_API_PATH}/${encodeId(orderId)}/items/${encodeId(itemId)}`,
    { method: "DELETE" },
  )
}
