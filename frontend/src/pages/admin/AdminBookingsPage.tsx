import { useEffect, useMemo, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  getRoomBookingRequests,
  type RoomBookingRequestRecord,
} from "@/services/roomBookingRequestApi"

function formatDateTime(value: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatStayDate(value: string) {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("vi-VN").format(date)
}

function statusLabel(status: string) {
  const normalized = status.trim().toUpperCase()
  if (normalized === "PENDING") return "Chờ xử lý"
  if (normalized === "CONFIRMED") return "Đã xác nhận"
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "Đã hủy"
  if (normalized === "COMPLETED") return "Hoàn tất"
  return status || "—"
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<RoomBookingRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [keyword, setKeyword] = useState("")

  const loadBookings = async () => {
    setLoading(true)
    setError("")
    try {
      setBookings(await getRoomBookingRequests())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách đơn đặt phòng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBookings()
  }, [])

  const visibleBookings = useMemo(() => {
    const query = keyword.trim().toLowerCase()
    if (!query) return bookings
    return bookings.filter((booking) =>
      [
        booking.id,
        booking.customerName,
        booking.customerPhone,
        booking.customerEmail ?? "",
        booking.roomType,
        booking.guests ?? "",
        booking.checkIn,
        booking.checkOut,
        booking.note ?? "",
        booking.status,
      ].some((value) => String(value).toLowerCase().includes(query)),
    )
  }, [bookings, keyword])

  const pendingCount = bookings.filter(
    (booking) => booking.status.trim().toUpperCase() === "PENDING",
  ).length

  const today = new Date().toISOString().slice(0, 10)
  const arrivingToday = bookings.filter((booking) => booking.checkIn === today).length

  return (
    <AdminRoomLayout
      eyebrow="SPRINT 2 · ĐẶT PHÒNG"
      title="Quản lý đơn đặt phòng"
      subtitle="Dữ liệu lấy từ form Đặt phòng và bảng room_booking_requests."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => void loadBookings()}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      }
    >
      <section className="admin-s2-stats">
        <article>
          <span>Tổng đơn đặt phòng</span>
          <strong>{bookings.length}</strong>
          <small>Dữ liệu trong MySQL</small>
        </article>
        <article>
          <span>Chờ xử lý</span>
          <strong>{pendingCount}</strong>
          <small>Trạng thái PENDING</small>
        </article>
        <article>
          <span>Nhận phòng hôm nay</span>
          <strong>{arrivingToday}</strong>
          <small>Theo ngày khách đã chọn</small>
        </article>
      </section>

      <section className="admin-s2-table-card admin-booking-card">
        <div className="admin-s2-section-heading admin-booking-heading">
          <div>
            <span>DANH SÁCH ĐƠN ĐẶT PHÒNG</span>
            <h2>Thông tin từ form khách hàng</h2>
          </div>
          <label className="admin-booking-search">
            <span>Tìm kiếm</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tên, SĐT, email, hạng phòng..."
            />
          </label>
        </div>

        {error && (
          <div className="admin-booking-error" role="alert">
            <strong>Không tải được đơn đặt phòng.</strong>
            <span>{error}</span>
            <small>Backend cần có GET /api/v1/room-booking-requests.</small>
          </div>
        )}

        {!error && loading ? (
          <div className="admin-booking-empty">
            <strong>Đang tải dữ liệu...</strong>
          </div>
        ) : !error && visibleBookings.length === 0 ? (
          <div className="admin-booking-empty">
            <strong>Chưa có đơn đặt phòng</strong>
            <p>Khi khách gửi form Đặt phòng, đơn sẽ xuất hiện tại đây.</p>
          </div>
        ) : !error ? (
          <div className="admin-s2-table-wrap">
            <table className="admin-s2-table admin-booking-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Họ và tên</th>
                  <th>Liên hệ</th>
                  <th>Hạng phòng</th>
                  <th>Số khách</th>
                  <th>Ngày nhận</th>
                  <th>Ngày trả</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>DP-{String(booking.id).padStart(6, "0")}</strong>
                      <small>{formatDateTime(booking.createdAt)}</small>
                    </td>
                    <td>
                      <strong>{booking.customerName}</strong>
                    </td>
                    <td>
                      <strong>{booking.customerPhone}</strong>
                      <small>{booking.customerEmail || "Không có email"}</small>
                    </td>
                    <td><strong>{booking.roomType}</strong></td>
                    <td><strong>{booking.guests ?? "—"}</strong></td>
                    <td><strong>{formatStayDate(booking.checkIn)}</strong></td>
                    <td><strong>{formatStayDate(booking.checkOut)}</strong></td>
                    <td className="admin-booking-note">{booking.note || "—"}</td>
                    <td>
                      <span className={`admin-booking-status admin-booking-status-${booking.status.toLowerCase()}`}>
                        {statusLabel(booking.status)}
                      </span>
                      <a className="admin-booking-call" href={`tel:${booking.customerPhone}`}>
                        Gọi khách
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </AdminRoomLayout>
  )
}
