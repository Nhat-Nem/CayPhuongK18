import { apiRequest } from "@/services/api"

/** Dữ liệu backend đang lưu cho yêu cầu đặt bàn. */
export interface TableBookingRequestRecord {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  note: string | null
  status: string
  createdAt: string
  updatedAt?: string
}

type BackendTableBookingRequest = {
  id?: string | number
  customerName?: string
  customerPhone?: string
  customerEmail?: string | null
  note?: string | null
  status?: string
  createdAt?: string
  updatedAt?: string
  // Hỗ trợ dữ liệu snake_case nếu backend đổi serializer, không thay đổi payload/API.
  customer_name?: string
  customer_phone?: string
  customer_email?: string | null
  created_at?: string
  updated_at?: string
}

function normalizeRecord(row: BackendTableBookingRequest): TableBookingRequestRecord {
  return {
    id: String(row.id ?? ""),
    customerName: String(row.customerName ?? row.customer_name ?? ""),
    customerPhone: String(row.customerPhone ?? row.customer_phone ?? ""),
    customerEmail: row.customerEmail ?? row.customer_email ?? null,
    note: row.note ?? null,
    status: String(row.status ?? "PENDING").toUpperCase(),
    createdAt: String(row.createdAt ?? row.created_at ?? ""),
    updatedAt: row.updatedAt ?? row.updated_at,
  }
}

/** GET /api/v1/table-booking-requests — backend trả danh sách mới nhất trước. */
export async function getTableBookingRequests(): Promise<TableBookingRequestRecord[]> {
  const response = await apiRequest<
    BackendTableBookingRequest[] | { data?: BackendTableBookingRequest[] }
  >("/api/v1/table-booking-requests")

  const rows = Array.isArray(response) ? response : response.data ?? []
  return rows.map(normalizeRecord)
}
