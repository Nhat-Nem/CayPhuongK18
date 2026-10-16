import { useEffect, useMemo, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  getRoomBookingRequests,
  updateRoomBookingRequestStatus,
  type RoomBookingRequestRecord,
  type RoomBookingStatus,
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

const BOOKING_STATUS_OPTIONS: Array<{
  value: RoomBookingStatus
  label: string
}> = [
  { value: "PENDING", label: "Chờ tiếp nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
]

export default function AdminRoomBookingRequestsPage() {
  const [records, setRecords] = useState<RoomBookingRequestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [keyword, setKeyword] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError("")

    try {
      setRecords(await getRoomBookingRequests())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải đơn đặt phòng",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleStatusChange = async (
    record: RoomBookingRequestRecord,
    status: RoomBookingStatus,
  ) => {
    if (status === record.status) return

    const previousStatus = record.status
    setUpdatingId(record.id)
    setError("")

    // Cập nhật giao diện ngay, nếu API lỗi sẽ trả lại trạng thái cũ.
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id ? { ...item, status } : item,
      ),
    )

    try {
      const updated = await updateRoomBookingRequestStatus(record.id, status)
      setRecords((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch (err) {
      setRecords((current) =>
        current.map((item) =>
          item.id === record.id
            ? { ...item, status: previousStatus }
            : item,
        ),
      )
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái đơn đặt phòng.",
      )
    } finally {
      setUpdatingId(null)
    }
  }

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
    (record) => record.status === "PENDING",
  ).length

  const today = new Date().toISOString().slice(0, 10)
  const checkInTodayCount = records.filter(
    (record) => record.checkIn === today,
  ).length

  return (
    <AdminRoomLayout
      eyebrow="TIẾP NHẬN"
      title="Tiếp nhận form Đặt phòng"
      subtitle="Các yêu cầu khách gửi từ mục Đặt phòng tại trang Liên hệ. Admin có thể cập nhật trạng thái trực tiếp tại danh sách."
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

        {error && (
          <div className="admin-room-booking-message error" role="alert">
            <strong>Có lỗi xảy ra</strong>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="admin-room-booking-message">
            <strong>Đang tải form đặt phòng...</strong>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="admin-room-booking-message">
            <strong>Chưa có form đặt phòng</strong>
            <p>
              Khi khách gửi mục Đặt phòng ở trang Liên hệ, yêu cầu sẽ xuất hiện
              tại đây.
            </p>
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
                    <td>
                      <strong>{record.customerName || "—"}</strong>
                    </td>
                    <td>
                      <strong>{record.customerPhone || "—"}</strong>
                      {record.customerPhone && (
                        <a
                          className="admin-room-booking-call"
                          href={`tel:${record.customerPhone}`}
                        >
                          Gọi khách
                        </a>
                      )}
                    </td>
                    <td>{record.customerEmail || "—"}</td>
                    <td>
                      <strong>{record.roomType || "—"}</strong>
                    </td>
                    <td>
                      <strong>{record.guests ?? "—"}</strong>
                    </td>
                    <td>{formatDate(record.checkIn)}</td>
                    <td>{formatDate(record.checkOut)}</td>
                    <td className="admin-room-booking-note">
                      {record.note || "—"}
                    </td>
                    <td>
                      <select
                        className="admin-s2-status"
                        value={record.status}
                        disabled={updatingId === record.id}
                        onChange={(event) =>
                          void handleStatusChange(
                            record,
                            event.target.value as RoomBookingStatus,
                          )
                        }
                        aria-label={`Trạng thái đơn DP-${record.id.padStart(
                          6,
                          "0",
                        )}`}
                      >
                        {BOOKING_STATUS_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {updatingId === record.id && (
                        <small className="admin-booking-status-saving">
                          Đang lưu...
                        </small>
                      )}
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
