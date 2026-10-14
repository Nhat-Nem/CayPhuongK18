import { useEffect, useMemo, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  getRoomBookingRequests,
  type RoomBookingRequestRecord,
} from "@/services/roomBookingRequestApi"

function formatDate(value: string) {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN").format(date)
}

function formatCreatedAt(value: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function statusLabel(value: string) {
  switch (value.trim().toUpperCase()) {
    case "PENDING": return "Chờ tiếp nhận"
    case "CONFIRMED": return "Đã xác nhận"
    case "CANCELLED":
    case "CANCELED": return "Đã hủy"
    case "COMPLETED": return "Hoàn tất"
    default: return value || "—"
  }
}

export default function AdminRoomBookingRequestsPage() {
  const [records, setRecords] = useState<RoomBookingRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [keyword, setKeyword] = useState("")

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      setRecords(await getRoomBookingRequests())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đơn đặt phòng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredRecords = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return records
    return records.filter((record) =>
      [
        record.id,
        record.customerName,
        record.customerPhone,
        record.customerEmail,
        record.roomType,
        record.guests ?? "",
        record.checkIn,
        record.checkOut,
        record.note,
        record.status,
      ].some((value) => String(value).toLowerCase().includes(q)),
    )
  }, [keyword, records])

  const pendingCount = records.filter(
    (record) => record.status.trim().toUpperCase() === "PENDING",
  ).length

  const today = new Date().toISOString().slice(0, 10)
  const checkInTodayCount = records.filter((record) => record.checkIn === today).length

  return (
    <AdminRoomLayout
      eyebrow="SPRINT 2 · TIẾP NHẬN"
      title="Tiếp nhận form Đặt phòng"
      subtitle="Các yêu cầu khách gửi từ mục Đặt phòng tại trang Liên hệ. Dữ liệu lấy từ GET /api/v1/room-booking-requests."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "↻ Làm mới"}
        </button>
      }
    >
      <section className="admin-s2-stats">
        <article>
          <span>Tổng form đặt phòng</span>
          <strong>{records.length}</strong>
          <small>Đã lưu trong hệ thống</small>
        </article>
        <article>
          <span>Chờ tiếp nhận</span>
          <strong>{pendingCount}</strong>
          <small>Cần Admin xử lý</small>
        </article>
        <article>
          <span>Nhận phòng hôm nay</span>
          <strong>{checkInTodayCount}</strong>
          <small>Theo ngày khách đã chọn</small>
        </article>
      </section>

      <section className="admin-s2-table-card admin-room-booking-card">
        <div className="admin-s2-section-heading admin-room-booking-heading">
          <div>
            <span>FORM KHÁCH HÀNG · ĐẶT PHÒNG</span>
            <h2>Danh sách yêu cầu đặt phòng</h2>
          </div>
          <label className="admin-room-booking-search">
            <span>Tìm kiếm</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên, SĐT, email, hạng phòng..."
            />
          </label>
        </div>

        {error ? (
          <div className="admin-room-booking-message error" role="alert">
            <strong>Không tải được form đặt phòng</strong>
            <p>{error}</p>
            <small>Kiểm tra backend có GET /api/v1/room-booking-requests và backend đang chạy.</small>
          </div>
        ) : loading ? (
          <div className="admin-room-booking-message">
            <strong>Đang tải form đặt phòng...</strong>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="admin-room-booking-message">
            <strong>Chưa có form đặt phòng</strong>
            <p>Khi khách gửi mục Đặt phòng ở trang Liên hệ, yêu cầu sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="admin-s2-table-wrap">
            <table className="admin-s2-table admin-room-booking-table">
              <thead>
                <tr>
                  <th>Mã form</th>
                  <th>Họ và tên</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  <th>Hạng phòng</th>
                  <th>Số khách</th>
                  <th>Ngày nhận</th>
                  <th>Ngày trả</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>DP-{record.id.padStart(6, "0")}</strong>
                      <small>{formatCreatedAt(record.createdAt)}</small>
                    </td>
                    <td><strong>{record.customerName || "—"}</strong></td>
                    <td>
                      <strong>{record.customerPhone || "—"}</strong>
                      {record.customerPhone && <a className="admin-room-booking-call" href={`tel:${record.customerPhone}`}>Gọi khách</a>}
                    </td>
                    <td>{record.customerEmail || "—"}</td>
                    <td><strong>{record.roomType || "—"}</strong></td>
                    <td><strong>{record.guests ?? "—"}</strong></td>
                    <td>{formatDate(record.checkIn)}</td>
                    <td>{formatDate(record.checkOut)}</td>
                    <td className="admin-room-booking-note">{record.note || "—"}</td>
                    <td>
                      <span className={`admin-room-booking-status status-${record.status.toLowerCase()}`}>
                        {statusLabel(record.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminRoomLayout>
  )
}
