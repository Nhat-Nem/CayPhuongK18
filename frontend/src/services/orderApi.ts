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
  /** Đơn tại bàn có tableNumber, đơn giao phòng có roomNumber (backend bắt buộc đúng một trong hai). */
  tableNumber?: string | null
  roomNumber?: string | null
  status: OrderStatus
  promotionId?: string | null
  promotionName?: string | null
  promotionType?: "PERCENTAGE" | "FIXED_AMOUNT" | null
  promotionValue?: string | number | null
  /** Số tiền đã giảm; totalAmount là số tiền sau giảm. */
  discountAmount?: string | number
  totalAmount: string | number
  paymentStatus: OrderPaymentStatus
  paymentMethod: OrderPaymentMethod | null
  paidAt: string | null
  createdBy: string | null
  items: OrderItemRecord[]
  createdAt: string
  updatedAt: string
}

/** Backend nhận note khi tạo/cập nhật đơn; số bàn hoặc số phòng chỉ gửi khi tạo đơn. */
export type OrderPayload = {
  note?: string | null
  tableNumber?: string
  roomNumber?: string
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
      ...(payload.tableNumber ? { tableNumber: payload.tableNumber } : {}),
      ...(payload.roomNumber ? { roomNumber: payload.roomNumber } : {}),
    }),
  })
}

/** Cập nhật ghi chú qua endpoint riêng để STAFF không gọi nhầm PATCH /orders/:id (ADMIN-only). */
export async function updateOrder(id: string, payload: OrderPayload) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}/note`, {
    method: "PATCH",
    body: JSON.stringify({
      ...(payload.note !== undefined ? { note: payload.note } : {}),
    }),
  })
}

/** PATCH /api/v1/orders/:id/status — API trạng thái đã có trong backend hiện tại. */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

/** PATCH /api/v1/orders/:id/payment — API ghi nhận thanh toán đã có trong backend hiện tại. */
export async function recordOrderPayment(
  id: string,
  paymentMethod: OrderPaymentMethod,
) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ paymentMethod }),
  })
}

/** PATCH /api/v1/orders/:id/promotion — backend tự kiểm tra ưu đãi và tính lại tổng tiền. */
export async function applyOrderPromotion(id: string, promotionId: string) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}/promotion`, {
    method: "PATCH",
    // ApplyPromotionDto của backend khai báo @IsString() cho promotionId.
    body: JSON.stringify({ promotionId: String(promotionId) }),
  })
}

/** DELETE /api/v1/orders/:id/promotion — bỏ ưu đãi và tính lại tổng tiền. */
export async function removeOrderPromotion(id: string) {
  return apiRequest<OrderRecord>(`${ORDERS_API_PATH}/${encodeId(id)}/promotion`, {
    method: "DELETE",
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
