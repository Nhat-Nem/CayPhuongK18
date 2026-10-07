import { useMemo, useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { getRooms } from "@/utils/roomStore"

type CustomerType = "Khách vãng lai" | "Khách đặt trước"

type ServiceType = "Phòng nghỉ" | "Nhà hàng"

type GuestStatus = "Chờ tiếp nhận" | "Đang phục vụ" | "Hoàn tất"

interface GuestRecord {
  id: string
  fullName: string
  phone: string
  customerType: CustomerType
  service: ServiceType
  guests: number
  roomId: string
  note: string
  status: GuestStatus
  createdAt: string
}

const STORAGE_KEY = "cay-phuong-walk-in-prototypes"

const defaultRows: GuestRecord[] = [
  {
    id: "VL-001",
    fullName: "Nguyễn Minh Anh",
    phone: "0901 234 567",
    customerType: "Khách vãng lai",
    service: "Phòng nghỉ",
    guests: 2,
    roomId: getRooms()[0]?.id ?? "",
    note: "Khách đến trực tiếp, cần kiểm tra phòng trống.",
    status: "Chờ tiếp nhận",
    createdAt: new Date().toISOString(),
  },
]

function readRows(): GuestRecord[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return defaultRows
    }

    const parsed = JSON.parse(saved) as Partial<GuestRecord>[]

    return parsed.map((item) => ({
      id: item.id ?? `KH-${String(Date.now()).slice(-6)}`,
      fullName: item.fullName ?? "",
      phone: item.phone ?? "",
      customerType: item.customerType ?? "Khách vãng lai",
      service: item.service ?? "Phòng nghỉ",
      guests: item.guests ?? 1,
      roomId: item.roomId ?? "",
      note: item.note ?? "",
      status: item.status ?? "Chờ tiếp nhận",
      createdAt: item.createdAt ?? new Date().toISOString(),
    }))
  } catch {
    return defaultRows
  }
}

export default function AdminWalkInPage() {
  const rooms = getRooms()

  const [rows, setRows] = useState<GuestRecord[]>(readRows)
  const [showForm, setShowForm] = useState(false)
  const [customerType, setCustomerType] =
    useState<CustomerType>("Khách vãng lai")
  const [service, setService] = useState<ServiceType>("Phòng nghỉ")
  const [query, setQuery] = useState("")

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")

    return rows.filter((item) => {
      if (!keyword) {
        return true
      }

      return [
        item.id,
        item.fullName,
        item.phone,
        item.customerType,
        item.service,
        item.note,
      ]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword)
    })
  }, [query, rows])

  const stats = useMemo(
    () => ({
      total: rows.length,
      waiting: rows.filter((item) => item.status === "Chờ tiếp nhận").length,
      serving: rows.filter((item) => item.status === "Đang phục vụ").length,
    }),
    [rows],
  )

  const saveRows = (nextRows: GuestRecord[]) => {
    setRows(nextRows)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRows))
  }

  const closeForm = () => {
    setShowForm(false)
    setCustomerType("Khách vãng lai")
    setService("Phòng nghỉ")
  }

  const addGuest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const record: GuestRecord = {
      id: `${customerType === "Khách vãng lai" ? "VL" : "DT"}-${String(
        Date.now(),
      ).slice(-6)}`,
      fullName: String(form.get("fullName") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      customerType,
      service,
      guests: Number(form.get("guests") ?? 1),
      roomId: String(form.get("roomId") ?? ""),
      note: String(form.get("note") ?? "").trim(),
      status: "Chờ tiếp nhận",
      createdAt: new Date().toISOString(),
    }

    saveRows([record, ...rows])
    event.currentTarget.reset()
    closeForm()
  }

  const setStatus = (id: string, status: GuestStatus) => {
    saveRows(
      rows.map((item) => (item.id === id ? { ...item, status } : item)),
    )
  }

  const removeRow = (id: string) => {
    if (window.confirm("Xóa lượt khách này?")) {
      saveRows(rows.filter((item) => item.id !== id))
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="SPRINT 2 · US.08"
      title="Tiếp nhận khách"
      subtitle="Giao diện tiếp nhận khách tại quầy: phân loại khách vãng lai hoặc khách đặt trước, ghi nhận dịch vụ, cập nhật trạng thái và quản lý thông tin khách. Dữ liệu hiện đang lưu tạm ở frontend."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => setShowForm(true)}
        >
          ＋ Tiếp nhận khách
        </button>
      }
    >
      <section className="admin-s2-stats">
        <article>
          <span>Tổng lượt ghi nhận</span>
          <strong>{stats.total}</strong>
          <small>Trong dữ liệu hiện tại</small>
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

      {showForm && (
        <section className="admin-s2-form-card">
          <div className="admin-s2-section-heading">
            <div>
              <span>BIỂU MẪU TIẾP NHẬN</span>
              <h2>Ghi nhận khách</h2>
            </div>

            <button
              className="admin-secondary-button"
              type="button"
              onClick={closeForm}
            >
              Đóng
            </button>
          </div>

          <form className="admin-s2-form" onSubmit={addGuest}>
            <label>
              <span>Phân loại khách *</span>
              <select
                value={customerType}
                onChange={(event) =>
                  setCustomerType(event.target.value as CustomerType)
                }
              >
                <option value="Khách vãng lai">Khách vãng lai</option>
                <option value="Khách đặt trước">Khách đặt trước</option>
              </select>
            </label>

            <label>
              <span>Họ và tên *</span>
              <input
                required
                name="fullName"
                placeholder="Nhập tên khách"
              />
            </label>

            <label>
              <span>Số điện thoại *</span>
              <input
                required
                name="phone"
                type="tel"
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
              <input
                required
                name="guests"
                type="number"
                min="1"
                defaultValue="1"
              />
            </label>

            {service === "Phòng nghỉ" && (
              <label>
                <span>Phòng</span>
                <select name="roomId">
                  <option value="">Chưa chọn phòng</option>
                  {rooms.map((room) => (
                    <option value={room.id} key={room.id}>
                      {room.name} · {room.code}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="admin-s2-full">
              <span>Ghi chú</span>
              <textarea
                name="note"
                rows={4}
                placeholder={
                  customerType === "Khách đặt trước"
                    ? "Ví dụ: mã đặt phòng, giờ dự kiến đến, yêu cầu đặc biệt..."
                    : "Nhu cầu hoặc ghi chú của khách..."
                }
              />
            </label>

            <div className="admin-s2-form-actions admin-s2-full">
              <button
                className="admin-secondary-button"
                type="button"
                onClick={closeForm}
              >
                Hủy
              </button>

              <button className="admin-primary-button" type="submit">
                Lưu thông tin khách
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-s2-table-card">
        <div className="admin-s2-section-heading">
          <div>
            <span>DANH SÁCH TRONG NGÀY</span>
            <h2>Khách đã ghi nhận</h2>
          </div>

          <label className="admin-room-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, SĐT, mã, loại khách..."
            />
          </label>
        </div>

        <div className="admin-s2-table-wrap">
          <table className="admin-s2-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Phân loại</th>
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
                    <strong>{item.id}</strong>
                  </td>

                  <td>
                    <strong>{item.fullName}</strong>
                    <small>{item.phone}</small>
                  </td>

                  <td>{item.customerType}</td>
                  <td>{item.service}</td>
                  <td>{item.guests}</td>
                  <td>{item.note || "—"}</td>

                  <td>
                    <select
                      className="admin-s2-status"
                      value={item.status}
                      onChange={(event) =>
                        setStatus(item.id, event.target.value as GuestStatus)
                      }
                    >
                      <option value="Chờ tiếp nhận">Chờ tiếp nhận</option>
                      <option value="Đang phục vụ">Đang phục vụ</option>
                      <option value="Hoàn tất">Hoàn tất</option>
                    </select>
                  </td>

                  <td>
                    <button
                      className="admin-icon-button danger"
                      type="button"
                      onClick={() => removeRow(item.id)}
                      title="Xóa"
                    >
                      ⌫
                    </button>
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
    </AdminRoomLayout>
  )
}
