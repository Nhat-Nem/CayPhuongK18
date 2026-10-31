import { useEffect, useMemo, useState } from "react"
import AdminFormModal from "@/components/admin/AdminFormModal"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  getTableBookingRequests,
  type TableBookingRequestRecord,
} from "@/services/tableBookingRequestApi"

function formatDateTime(value: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function statusLabel(value: string) {
  const status = value.trim().toUpperCase()
  if (status === "PENDING") return "Chờ tiếp nhận"
  if (status === "CONFIRMED") return "Đã xác nhận"
  if (status === "COMPLETED") return "Hoàn tất"
  if (status === "CANCELLED" || status === "CANCELED") return "Đã hủy"
  return value || "—"
}

function formatRequestCode(id: string) {
  return `DB-${id.padStart(6, "0")}`
}

export default function AdminTableBookingRequestsPage() {
  const [requests, setRequests] = useState<TableBookingRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [keyword, setKeyword] = useState("")
  const [selectedRequest, setSelectedRequest] =
    useState<TableBookingRequestRecord | null>(null)

  const loadRequests = async () => {
    setLoading(true)
    setError("")

    try {
      setRequests(await getTableBookingRequests())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách yêu cầu đặt bàn.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRequests()
  }, [])

  const filteredRequests = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi")
    if (!query) return requests

    return requests.filter((request) =>
      [
        request.id,
        request.customerName,
        request.customerPhone,
        request.customerEmail ?? "",
        request.note ?? "",
        request.status,
      ].some((value) => String(value).toLocaleLowerCase("vi").includes(query)),
    )
  }, [keyword, requests])

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING",
  ).length

  return (
    <AdminRoomLayout
      eyebrow="TIẾP NHẬN · ĐẶT BÀN"
      title="Tiếp nhận yêu cầu đặt bàn"
      subtitle="Các yêu cầu được gửi từ nút Đặt bàn hoặc mục Đặt bàn trên trang Liên hệ. Danh sách được lấy trực tiếp từ hệ thống."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => void loadRequests()}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "↻ Làm mới"}
        </button>
      }
    >
      <section className="admin-s2-stats admin-table-booking-stats">
        <article>
          <span>TỔNG YÊU CẦU ĐẶT BÀN</span>
          <strong>{requests.length}</strong>
          <small>Tất cả yêu cầu khách đã gửi</small>
        </article>
        <article>
          <span>CHỜ TIẾP NHẬN</span>
          <strong>{pendingCount}</strong>
          <small>Trạng thái PENDING từ backend</small>
        </article>
        <article>
          <span>KẾT QUẢ ĐANG HIỂN THỊ</span>
          <strong>{filteredRequests.length}</strong>
          <small>Sau khi áp dụng tìm kiếm</small>
        </article>
      </section>

      <section className="admin-s2-table-card admin-table-booking-card">
        <div className="admin-s2-section-heading admin-table-booking-heading">
          <div>
            <span>FORM KHÁCH HÀNG · ĐẶT BÀN</span>
            <h2>Danh sách yêu cầu đặt bàn</h2>
            <p>Thông tin ngày giờ và số lượng khách (nếu có) được lưu trong phần ghi chú khách hàng.</p>
          </div>
          <label className="admin-table-booking-search">
            <span>Tìm theo tên, số điện thoại, email hoặc nội dung</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập từ khóa tìm kiếm..."
            />
          </label>
        </div>

        {error && (
          <div className="admin-table-booking-message is-error" role="alert">
            <strong>Không thể tải yêu cầu đặt bàn.</strong>
            <span>{error}</span>
            <small>Endpoint đang sử dụng: GET /api/v1/table-booking-requests</small>
          </div>
        )}

        {loading ? (
          <div className="admin-table-booking-message">
            <strong>Đang tải yêu cầu đặt bàn...</strong>
          </div>
        ) : !error && filteredRequests.length === 0 ? (
          <div className="admin-table-booking-message">
            <strong>{requests.length ? "Không tìm thấy yêu cầu phù hợp" : "Chưa có yêu cầu đặt bàn"}</strong>
            <span>{requests.length ? "Thử thay đổi từ khóa tìm kiếm." : "Khi khách gửi form Đặt bàn trên website, yêu cầu sẽ xuất hiện tại đây."}</span>
          </div>
        ) : !error ? (
          <div className="admin-s2-table-wrap">
            <table className="admin-s2-table admin-table-booking-table">
              <thead>
                <tr>
                  <th>Mã yêu cầu</th>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Ghi chú đặt bàn</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{formatRequestCode(request.id)}</strong>
                    </td>
                    <td>
                      <strong>{request.customerName || "—"}</strong>
                    </td>
                    <td>
                      <strong>{request.customerPhone || "—"}</strong>
                      {request.customerPhone && (
                        <a
                          className="admin-table-booking-call"
                          href={`tel:${request.customerPhone}`}
                        >
                          Gọi khách
                        </a>
                      )}
                      <small>{request.customerEmail || "Không có email"}</small>
                    </td>
                    <td className="admin-table-booking-note">
                      {request.note?.trim() || "Khách không để lại ghi chú."}
                    </td>
                    <td>{formatDateTime(request.createdAt)}</td>
                    <td>
                      <span className={`admin-table-booking-status status-${request.status.toLowerCase()}`}>
                        {statusLabel(request.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-table-booking-detail"
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <p className="admin-table-booking-footnote">
        Lưu ý: Backend hiện hỗ trợ tạo và xem yêu cầu đặt bàn (POST/GET), chưa có API cập nhật trạng thái. Vì vậy màn hình này chỉ hiển thị yêu cầu và hỗ trợ liên hệ khách, không tự giả lập thao tác xác nhận.
      </p>

      <AdminFormModal
        open={Boolean(selectedRequest)}
        eyebrow="CHI TIẾT YÊU CẦU ĐẶT BÀN"
        title={selectedRequest ? formatRequestCode(selectedRequest.id) : "Chi tiết yêu cầu"}
        onClose={() => setSelectedRequest(null)}
        size="wide"
      >
        {selectedRequest && (
          <div className="admin-table-booking-detail-panel">
            <div className="admin-table-booking-detail-grid">
              <div><span>Họ và tên</span><strong>{selectedRequest.customerName || "—"}</strong></div>
              <div><span>Số điện thoại</span><strong>{selectedRequest.customerPhone || "—"}</strong></div>
              <div><span>Email</span><strong>{selectedRequest.customerEmail || "—"}</strong></div>
              <div><span>Thời gian gửi</span><strong>{formatDateTime(selectedRequest.createdAt)}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabel(selectedRequest.status)}</strong></div>
            </div>
            <div className="admin-table-booking-detail-note">
              <span>Ghi chú / thời gian mong muốn</span>
              <p>{selectedRequest.note?.trim() || "Khách không để lại ghi chú."}</p>
            </div>
            {selectedRequest.customerPhone && (
              <a className="admin-primary-button admin-table-booking-call-button" href={`tel:${selectedRequest.customerPhone}`}>
                Gọi khách hàng
              </a>
            )}
          </div>
        )}
      </AdminFormModal>
    </AdminRoomLayout>
  )
}
