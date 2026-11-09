import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminFormModal from "@/components/admin/AdminFormModal"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import type { RoomPrototype } from "@/data/roomPrototype"
import { getRooms } from "@/services/roomApi"
import {
  checkInRoomStay,
  checkOutRoomStay,
  getRoomStays,
  type RoomStayPaymentMethod,
  type RoomStayRecord,
} from "@/services/roomStayApi"
import {
  createWalkIn,
  deleteWalkIn,
  getWalkIns,
  updateWalkIn,
  type GuestStatus,
  type ServiceType,
  type WalkInRecord,
} from "@/services/walkInApi"


function compareWalkInsNewestFirst(a: WalkInRecord, b: WalkInRecord) {
  const aTime = Date.parse(a.createdAt)
  const bTime = Date.parse(b.createdAt)

  if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
    return bTime - aTime
  }

  return b.id - a.id
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)} VNĐ`
}

type WalkInRoomAction =
  | { kind: "check-in"; record: WalkInRecord }
  | { kind: "check-out"; record: WalkInRecord; stay: RoomStayRecord }

export default function AdminWalkInPage() {
  const [rooms, setRooms] = useState<RoomPrototype[]>([])
  const [roomStays, setRoomStays] = useState<RoomStayRecord[]>([])
  const [rows, setRows] = useState<WalkInRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [service, setService] = useState<ServiceType>("Phòng nghỉ")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [roomDataError, setRoomDataError] = useState("")
  const [saving, setSaving] = useState(false)
  const [activeRoomAction, setActiveRoomAction] = useState<WalkInRoomAction | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<RoomStayPaymentMethod>("CASH")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState("")

  const loadData = async () => {
    setError("")
    const [roomResult, walkInResult, stayResult] = await Promise.allSettled([
      getRooms(),
      getWalkIns(),
      getRoomStays(),
    ])

    if (walkInResult.status === "fulfilled") {
      setRows([...walkInResult.value].sort(compareWalkInsNewestFirst))
    } else {
      setError(walkInResult.reason instanceof Error
        ? walkInResult.reason.message
        : "Không thể tải danh sách khách vãng lai.",
      )
    }

    setRooms(roomResult.status === "fulfilled" ? roomResult.value : [])
    setRoomStays(stayResult.status === "fulfilled" ? stayResult.value : [])
    const roomIssue = roomResult.status === "rejected" ? roomResult.reason
      : stayResult.status === "rejected" ? stayResult.reason
        : null
    setRoomDataError(roomIssue instanceof Error
      ? roomIssue.message
      : roomIssue
        ? "Không thể tải dữ liệu phòng và lưu trú."
        : "",
    )
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")

    return rows.filter(
      (item) =>
        !keyword ||
        [item.code, item.fullName, item.phone, item.service, item.note ?? ""]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(keyword),
    )
  }, [query, rows])

  const stats = useMemo(
    () => ({
      total: rows.length,
      waiting: rows.filter((item) => item.status === "Chờ tiếp nhận").length,
      serving: rows.filter((item) => item.status === "Đang phục vụ").length,
    }),
    [rows],
  )

  const occupiedRoomIds = useMemo(() => new Set(
    roomStays
      .filter((stay) => stay.status === "CHECKED_IN")
      .map((stay) => String(stay.roomId)),
  ), [roomStays])

  const availableRooms = useMemo(
    () => roomDataError
      ? []
      : rooms.filter((room) => room.status === "AVAILABLE" && !occupiedRoomIds.has(String(room.id))),
    [occupiedRoomIds, roomDataError, rooms],
  )

  const getActiveStay = (record: WalkInRecord) =>
    roomStays.find((stay) =>
      String(stay.walkInVisitId) === String(record.id) && stay.status === "CHECKED_IN",
    )

  const closeForm = () => {
    setShowForm(false)
    setService("Phòng nghỉ")
    setError("")
  }

  const addGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const roomIdValue = String(form.get("roomId") ?? "").trim()

    if (service === "Phòng nghỉ" && !roomIdValue) {
      setError("Vui lòng chọn phòng cho khách lưu trú.")
      return
    }

    setSaving(true)
    setError("")

    try {
      await createWalkIn({
        fullName: String(form.get("fullName") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        service,
        guests: Number(form.get("guests") ?? 1),
        roomId:
          service === "Phòng nghỉ" && roomIdValue
            ? Number(roomIdValue)
            : null,
        note: String(form.get("note") ?? "").trim(),
      })

      setShowForm(false)
      setService("Phòng nghỉ")
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tiếp nhận khách")
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (id: number, status: GuestStatus) => {
    try {
      await updateWalkIn(id, { status })
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái",
      )
    }
  }

  const openRoomCheckIn = (record: WalkInRecord) => {
    const assignedRoom = availableRooms.find((room) => room.id === record.roomId)
    setSelectedRoomId(String(assignedRoom?.id ?? availableRooms[0]?.id ?? ""))
    setActionError("")
    setActiveRoomAction({ kind: "check-in", record })
  }

  const openRoomCheckOut = (record: WalkInRecord) => {
    const stay = getActiveStay(record)
    if (!stay) {
      setRoomDataError("Không tìm thấy lượt lưu trú đang mở cho khách này. Hãy làm mới dữ liệu hoặc kiểm tra lượt nhận phòng.")
      return
    }

    setPaymentMethod("CASH")
    setActionError("")
    setActiveRoomAction({ kind: "check-out", record, stay })
  }

  const submitRoomAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeRoomAction) return

    setActionLoading(true)
    setActionError("")

    try {
      if (activeRoomAction.kind === "check-in") {
        if (!selectedRoomId) {
          setActionError("Chọn phòng còn trống để nhận khách.")
          return
        }
        await checkInRoomStay({
          roomId: selectedRoomId,
          walkInVisitId: String(activeRoomAction.record.id),
        })
      } else {
        await checkOutRoomStay(activeRoomAction.stay.id, paymentMethod)
      }

      setActiveRoomAction(null)
      await loadData()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Không thể cập nhật lượt lưu trú.")
    } finally {
      setActionLoading(false)
    }
  }

  const removeRow = async (id: number) => {
    if (!window.confirm("Xóa lượt khách vãng lai này?")) return

    try {
      await deleteWalkIn(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa lượt khách")
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="TIẾP NHẬN TRỰC TIẾP"
      title="Tiếp nhận khách vãng lai"
      subtitle="Ghi nhận khách đến trực tiếp, không có lịch đặt trước."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => {
            setError("")
            setShowForm(true)
          }}
        >
          + Tiếp nhận khách
        </button>
      }
    >
      <section className="admin-s2-stats">
        <article>
          <span>Tổng lượt ghi nhận</span>
          <strong>{stats.total}</strong>
          <small>Dữ liệu Sprint 2</small>
        </article>
        <article>
          <span>Chờ tiếp nhận</span>
          <strong>{stats.waiting}</strong>
          <small>Cần xử lý</small>
        </article>
        <article>
          <span>Đang phục vụ</span>
          <strong>{stats.serving}</strong>
          <small>Đang hoạt động</small>
        </article>
      </section>

      {!showForm && error && <p className="booking-form-error">{error}</p>}

      {roomDataError && (
        <div className="admin-room-booking-message error" role="alert">
          <strong>Chưa tải được dữ liệu phòng hoặc lưu trú</strong>
          <p>{roomDataError}</p>
        </div>
      )}

      <section className="admin-s2-table-card">
        <div className="admin-s2-section-heading">
          <div>
            <span>DANH SÁCH TRONG NGÀY</span>
            <h2>Khách vãng lai đã ghi nhận</h2>
          </div>
          <label className="admin-room-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, SĐT, mã..."
            />
          </label>
        </div>

        <div className="admin-s2-table-wrap">
          <table className="admin-s2-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Số khách</th>
                <th>Ghi chú</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.code}</strong>
                  </td>
                  <td>
                    <strong>{item.fullName}</strong>
                    <small>{item.phone}</small>
                  </td>
                  <td>{item.service}</td>
                  <td>{item.guests}</td>
                  <td>{item.note || "—"}</td>
                  <td>
                    {item.service === "Phòng nghỉ" ? (
                      <span className={`admin-room-booking-status status-${item.status === "Đang phục vụ" ? "serving" : item.status === "Hoàn tất" ? "completed" : "pending"}`}>
                        {item.status}
                      </span>
                    ) : (
                      <select
                        className="admin-s2-status"
                        value={item.status}
                        onChange={(event) =>
                          void setStatus(item.id, event.target.value as GuestStatus)
                        }
                      >
                        <option value="Chờ tiếp nhận">Chờ tiếp nhận</option>
                        <option value="Đang phục vụ">Đang phục vụ</option>
                        <option value="Hoàn tất">Hoàn tất</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <div className="admin-room-booking-row-actions">
                      {item.service === "Phòng nghỉ" && item.status === "Chờ tiếp nhận" && (
                        <button
                          className="admin-primary-button admin-room-booking-action-button"
                          type="button"
                          disabled={availableRooms.length === 0 || Boolean(roomDataError)}
                          onClick={() => openRoomCheckIn(item)}
                        >
                          Nhận phòng
                        </button>
                      )}
                      {item.service === "Phòng nghỉ" && item.status === "Đang phục vụ" && (
                        <button
                          className="admin-primary-button admin-room-booking-action-button"
                          type="button"
                          disabled={!getActiveStay(item) || Boolean(roomDataError)}
                          onClick={() => openRoomCheckOut(item)}
                        >
                          {getActiveStay(item) ? "Trả phòng & thanh toán" : "Thiếu lượt lưu trú"}
                        </button>
                      )}
                      <button
                        className="admin-icon-button danger"
                        type="button"
                        onClick={() => void removeRow(item.id)}
                        title="Xóa"
                      >
                        ⌫
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRows.length === 0 && (
          <div className="admin-room-empty">
            <strong>Không có kết quả phù hợp</strong>
            <span>Hãy thử một từ khóa khác.</span>
          </div>
        )}
      </section>

      <AdminFormModal
        open={showForm}
        eyebrow="BIỂU MẪU TIẾP NHẬN"
        title="Ghi nhận khách vãng lai"
        size="wide"
        onClose={closeForm}
      >
        <form className="admin-s2-form admin-s2-form--modal" onSubmit={addGuest}>
          <label>
            <span>Họ và tên *</span>
            <input required name="fullName" placeholder="Nhập tên khách" />
          </label>

          <label>
            <span>Số điện thoại *</span>
            <input
              required
              name="phone"
              type="tel"
              maxLength={15}
              pattern="[0-9 +().-]{9,15}"
              placeholder="09xx xxx xxx"
            />
          </label>

          <label>
            <span>Dịch vụ *</span>
            <select
              value={service}
              onChange={(event) =>
                setService(event.target.value as ServiceType)
              }
            >
              <option value="Phòng nghỉ">Phòng nghỉ</option>
              <option value="Nhà hàng">Nhà hàng</option>
            </select>
          </label>

          <label>
            <span>Số khách *</span>
            <input required name="guests" type="number" min="1" defaultValue="1" />
          </label>

          {service === "Phòng nghỉ" && (
            <label className="admin-s2-full">
              <span>Phòng *</span>
              <select name="roomId" required defaultValue="">
                <option value="" disabled>
                  Chọn phòng đang hoạt động
                </option>
                {availableRooms.map((room) => (
                  <option value={room.id} key={room.id}>
                    {room.name} · {room.code}
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && (
                <small>Hiện không có phòng AVAILABLE để tiếp nhận.</small>
              )}
            </label>
          )}

          <label className="admin-s2-full">
            <span>Ghi chú</span>
            <textarea
              name="note"
              rows={4}
              placeholder="Nhu cầu hoặc ghi chú của khách..."
            />
          </label>

          {error && (
            <div className="admin-room-form-notice error admin-s2-full">
              ⚠ {error}
            </div>
          )}

          <div className="admin-s2-form-actions admin-s2-full">
            <button
              className="admin-secondary-button"
              type="button"
              onClick={closeForm}
            >
              Hủy
            </button>
            <button
              className="admin-primary-button"
              disabled={saving || (service === "Phòng nghỉ" && availableRooms.length === 0)}
              type="submit"
            >
              {saving ? "Đang lưu..." : "Lưu thông tin khách"}
            </button>
          </div>
        </form>
      </AdminFormModal>
      <AdminFormModal
        open={Boolean(activeRoomAction)}
        eyebrow="QUẢN LÝ LƯU TRÚ"
        title={activeRoomAction?.kind === "check-out" ? "Trả phòng và thanh toán" : "Nhận phòng khách vãng lai"}
        onClose={() => !actionLoading && setActiveRoomAction(null)}
      >
        {activeRoomAction?.kind === "check-in" ? (
          <form className="admin-s2-form admin-s2-form--modal admin-room-booking-action-form" onSubmit={submitRoomAction}>
            <p className="admin-room-booking-modal-note admin-s2-full">
              Chọn phòng còn trống cho <strong>{activeRoomAction.record.fullName}</strong>. Giá theo đêm sẽ lấy từ thông tin phòng.
            </p>
            <label className="admin-s2-full">
              <span>Phòng còn trống</span>
              <select value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)} required>
                {availableRooms.length === 0 ? (
                  <option value="">Không có phòng còn trống</option>
                ) : availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name} · {room.code} · {formatMoney(room.price)}/đêm</option>
                ))}
              </select>
            </label>
            {actionError && <div className="admin-room-booking-modal-error admin-s2-full" role="alert">{actionError}</div>}
            <div className="admin-s2-form-actions admin-s2-full">
              <button className="admin-secondary-button" type="button" onClick={() => setActiveRoomAction(null)} disabled={actionLoading}>Hủy</button>
              <button className="admin-primary-button" type="submit" disabled={actionLoading || availableRooms.length === 0}>
                {actionLoading ? "Đang nhận phòng..." : "Xác nhận nhận phòng"}
              </button>
            </div>
          </form>
        ) : activeRoomAction?.kind === "check-out" ? (
          <form className="admin-s2-form admin-s2-form--modal admin-room-booking-action-form" onSubmit={submitRoomAction}>
            <p className="admin-room-booking-modal-note admin-s2-full">
              {activeRoomAction.stay.room?.name || `Phòng #${activeRoomAction.stay.roomId}`} · {formatMoney(Number(activeRoomAction.stay.roomPrice))}/đêm. Hệ thống tính tiền theo số đêm lưu trú và ghi doanh thu sau khi xác nhận thanh toán.
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
              <button className="admin-secondary-button" type="button" onClick={() => setActiveRoomAction(null)} disabled={actionLoading}>Hủy</button>
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
