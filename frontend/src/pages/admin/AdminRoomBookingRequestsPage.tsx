import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminFormModal from "@/components/admin/AdminFormModal"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import type { RoomPrototype } from "@/data/roomPrototype"
import { getRooms } from "@/services/roomApi"
import {
  getRoomBookingRequests,
  updateRoomBookingRequestStatus,
  type RoomBookingRequestRecord,
  type RoomBookingStatus,
} from "@/services/roomBookingRequestApi"
import {
  checkInRoomStay,
  checkOutRoomStay,
  getRoomStays,
  type RoomStayPaymentMethod,
  type RoomStayRecord,
} from "@/services/roomStayApi"

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

function statusLabel(status: RoomBookingStatus) {
  if (status === "PENDING") return "Chờ tiếp nhận"
  if (status === "CONFIRMED") return "Đã xác nhận"
  if (status === "SERVING") return "Đang lưu trú"
  if (status === "COMPLETED") return "Hoàn tất"
  return "Đã hủy"
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)} VNĐ`
}

function roomChoicesForRequest(
  record: RoomBookingRequestRecord,
  rooms: RoomPrototype[],
  roomStays: RoomStayRecord[],
) {
  const occupiedRoomIds = new Set(
    roomStays
      .filter((stay) => stay.status === "CHECKED_IN")
      .map((stay) => String(stay.roomId)),
  )
  const available = rooms.filter((room) =>
    room.status === "AVAILABLE" && !occupiedRoomIds.has(String(room.id)),
  )
  const requested = record.roomType.trim().toLocaleLowerCase("vi")
  const matching = available.filter((room) =>
    [room.name, room.type, room.code].some((value) =>
      value.trim().toLocaleLowerCase("vi") === requested,
    ),
  )

  return matching.length ? matching : available
}

type RoomBookingAction =
  | { kind: "check-in"; record: RoomBookingRequestRecord }
  | { kind: "check-out"; record: RoomBookingRequestRecord; stay: RoomStayRecord }

export default function AdminRoomBookingRequestsPage() {
  const [records, setRecords] = useState<RoomBookingRequestRecord[]>([])
  const [rooms, setRooms] = useState<RoomPrototype[]>([])
  const [roomStays, setRoomStays] = useState<RoomStayRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [roomDataError, setRoomDataError] = useState("")
  const [keyword, setKeyword] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<RoomBookingAction | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<RoomStayPaymentMethod>("CASH")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState("")

  const loadData = async () => {
    setLoading(true)
    setError("")

    const [requestsResult, roomsResult, staysResult] = await Promise.allSettled([
      getRoomBookingRequests(),
      getRooms(),
      getRoomStays(),
    ])

    if (requestsResult.status === "fulfilled") {
      const requestRecords = requestsResult.value
      const activeStays = staysResult.status === "fulfilled"
        ? staysResult.value.filter((stay) => stay.status === "CHECKED_IN")
        : []

      // Backend completes the booking request at check-in. The active room stay
      // is the source of truth for showing the in-progress stay in this screen.
      setRecords(requestRecords.map((record) =>
        activeStays.some((stay) => String(stay.bookingRequestId) === record.id)
          ? { ...record, status: "SERVING" as const }
          : record,
      ))
    } else {
      setError(
        requestsResult.reason instanceof Error
          ? requestsResult.reason.message
          : "Không thể tải đơn đặt phòng",
      )
    }

    if (roomsResult.status === "fulfilled" && staysResult.status === "fulfilled") {
      setRooms(roomsResult.value)
      setRoomStays(staysResult.value)
      setRoomDataError("")
    } else {
      setRooms(roomsResult.status === "fulfilled" ? roomsResult.value : [])
      setRoomStays(staysResult.status === "fulfilled" ? staysResult.value : [])
      const issue = roomsResult.status === "rejected" ? roomsResult.reason :
        staysResult.status === "rejected" ? staysResult.reason : null
      setRoomDataError(issue instanceof Error
        ? issue.message
        : "Không thể tải dữ liệu phòng và lưu trú.",
      )
    }

    setLoading(false)
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

  const openCheckIn = (record: RoomBookingRequestRecord) => {
    const choices = roomChoicesForRequest(record, rooms, roomStays)
    setSelectedRoomId(String(choices[0]?.id ?? ""))
    setActionError("")
    setActiveAction({ kind: "check-in", record })
  }

  const openCheckOut = (record: RoomBookingRequestRecord) => {
    const stay = roomStays.find((item) =>
      String(item.bookingRequestId) === record.id && item.status === "CHECKED_IN",
    )

    if (!stay) {
      setRoomDataError("Không tìm thấy lượt lưu trú đang mở. Hãy làm mới danh sách rồi thử lại.")
      return
    }

    setPaymentMethod("CASH")
    setActionError("")
    setActiveAction({ kind: "check-out", record, stay })
  }

  const submitRoomAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeAction) return

    setActionLoading(true)
    setActionError("")

    try {
      if (activeAction.kind === "check-in") {
        if (!selectedRoomId) {
          setActionError("Chọn phòng còn trống để nhận khách.")
          return
        }
        await checkInRoomStay({
          roomId: selectedRoomId,
          bookingRequestId: activeAction.record.id,
        })
      } else {
        await checkOutRoomStay(activeAction.stay.id, paymentMethod)
      }

      setActiveAction(null)
      await loadData()
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật lượt lưu trú.",
      )
    } finally {
      setActionLoading(false)
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

  const servingCount = records.filter((record) => record.status === "SERVING").length

  return (
    <AdminRoomLayout
      eyebrow="TIẾP NHẬN"
      title="Tiếp nhận form Đặt phòng"
      subtitle="Xác nhận yêu cầu, chọn phòng khi khách đến và ghi nhận thanh toán khi trả phòng. Doanh thu lấy từ giá phòng và chỉ tăng sau khi thanh toán."
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
          <span>Đang lưu trú</span>
          <strong>{servingCount}</strong>
          <small>Đã nhận phòng, chưa trả phòng</small>
        </article>
      </section>

      {roomDataError && (
        <div className="admin-room-booking-message error" role="alert">
          <strong>Chưa tải được dữ liệu phòng hoặc lưu trú</strong>
          <p>{roomDataError}</p>
        </div>
      )}

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
                      <div className="admin-room-booking-row-actions">
                        {(record.status === "PENDING" || record.status === "CONFIRMED") && (
                          <select
                            className="admin-s2-status"
                            value={record.status}
                            disabled={updatingId === record.id}
                            onChange={(event) => void handleStatusChange(
                              record,
                              event.target.value as RoomBookingStatus,
                            )}
                            aria-label={`Trạng thái đơn DP-${record.id.padStart(6, "0")}`}
                          >
                            <option value={record.status}>{statusLabel(record.status)}</option>
                            {record.status === "PENDING" && (
                              <option value="CONFIRMED">Đã xác nhận</option>
                            )}
                            <option value="CANCELLED">Đã hủy</option>
                          </select>
                        )}
                        {(record.status === "SERVING" || record.status === "COMPLETED" || record.status === "CANCELLED") && (
                          <span className={`admin-room-booking-status status-${record.status.toLowerCase()}`}>
                            {statusLabel(record.status)}
                          </span>
                        )}
                        {record.status === "CONFIRMED" && (
                          <button
                            className="admin-primary-button admin-room-booking-action-button"
                            type="button"
                            disabled={roomChoicesForRequest(record, rooms, roomStays).length === 0 || Boolean(roomDataError)}
                            onClick={() => openCheckIn(record)}
                          >
                            Nhận phòng
                          </button>
                        )}
                        {record.status === "SERVING" && (
                          <button
                            className="admin-primary-button admin-room-booking-action-button"
                            type="button"
                            disabled={Boolean(roomDataError)}
                            onClick={() => openCheckOut(record)}
                          >
                            Trả phòng & thanh toán
                          </button>
                        )}
                        {updatingId === record.id && (
                          <small className="admin-booking-status-saving">Đang lưu...</small>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <AdminFormModal
        open={Boolean(activeAction)}
        eyebrow="QUẢN LÝ LƯU TRÚ"
        title={activeAction?.kind === "check-out" ? "Trả phòng và thanh toán" : "Nhận phòng"}
        onClose={() => !actionLoading && setActiveAction(null)}
      >
        {activeAction?.kind === "check-in" ? (
          <form className="admin-s2-form admin-s2-form--modal admin-room-booking-action-form" onSubmit={submitRoomAction}>
            <p className="admin-room-booking-modal-note admin-s2-full">
              Khách yêu cầu hạng <strong>{activeAction.record.roomType || "chưa chọn hạng phòng"}</strong>. Chọn phòng thực tế; giá mỗi đêm sẽ lấy từ thông tin phòng.
            </p>
            <label className="admin-s2-full">
              <span>Phòng còn trống</span>
              <select value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)} required>
                {roomChoicesForRequest(activeAction.record, rooms, roomStays).length === 0 ? (
                  <option value="">Không có phòng còn trống</option>
                ) : roomChoicesForRequest(activeAction.record, rooms, roomStays).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} · {room.code} · {formatMoney(room.price)}/đêm
                  </option>
                ))}
              </select>
            </label>
            {actionError && <div className="admin-room-booking-modal-error admin-s2-full" role="alert">{actionError}</div>}
            <div className="admin-s2-form-actions admin-s2-full">
              <button className="admin-secondary-button" type="button" onClick={() => setActiveAction(null)} disabled={actionLoading}>Hủy</button>
              <button className="admin-primary-button" type="submit" disabled={actionLoading || roomChoicesForRequest(activeAction.record, rooms, roomStays).length === 0}>
                {actionLoading ? "Đang nhận phòng..." : "Xác nhận nhận phòng"}
              </button>
            </div>
          </form>
        ) : activeAction?.kind === "check-out" ? (
          <form className="admin-s2-form admin-s2-form--modal admin-room-booking-action-form" onSubmit={submitRoomAction}>
            <p className="admin-room-booking-modal-note admin-s2-full">
              {activeAction.stay.room?.name || `Phòng #${activeAction.stay.roomId}`} · {formatMoney(Number(activeAction.stay.roomPrice))}/đêm. Hệ thống tính tiền theo số đêm lưu trú và chỉ cộng doanh thu sau khi xác nhận thanh toán.
            </p>
            <label className="admin-s2-full">
              <span>Phương thức thanh toán</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as RoomStayPaymentMethod)}>
                <option value="CASH">Tiền mặt</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ</option>
              </select>
            </label>
            {actionError && <div className="admin-room-booking-modal-error admin-s2-full" role="alert">{actionError}</div>}
            <div className="admin-s2-form-actions admin-s2-full">
              <button className="admin-secondary-button" type="button" onClick={() => setActiveAction(null)} disabled={actionLoading}>Hủy</button>
              <button className="admin-primary-button" type="submit" disabled={actionLoading}>
                {actionLoading ? "Đang lưu thanh toán..." : "Xác nhận trả phòng"}
              </button>
            </div>
          </form>
        ) : null}
      </AdminFormModal>
    </AdminRoomLayout>
  )
}
