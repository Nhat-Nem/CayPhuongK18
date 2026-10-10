import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import type { RoomPrototype } from "@/data/roomPrototype"
import { getRooms } from "@/services/roomApi"
import { createWalkIn, deleteWalkIn, getWalkIns, updateWalkIn, type GuestStatus, type ServiceType, type WalkInRecord } from "@/services/walkInApi"

export default function AdminWalkInPage() {
  const [rooms, setRooms] = useState<RoomPrototype[]>([])
  const [rows, setRows] = useState<WalkInRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [service, setService] = useState<ServiceType>("Phòng nghỉ")
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      const [roomData, walkIns] = await Promise.all([getRooms(), getWalkIns()])
      setRooms(roomData)
      setRows(walkIns)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu")
    }
  }

  useEffect(() => { void loadData() }, [])

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")
    return rows.filter((item) => !keyword || [item.code, item.fullName, item.phone, item.service, item.note ?? ""].join(" ").toLocaleLowerCase("vi").includes(keyword))
  }, [query, rows])

  const stats = useMemo(() => ({
    total: rows.length,
    waiting: rows.filter((item) => item.status === "Chờ tiếp nhận").length,
    serving: rows.filter((item) => item.status === "Đang phục vụ").length,
  }), [rows])

  const closeForm = () => { setShowForm(false); setService("Phòng nghỉ") }

  const addGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setSaving(true); setError("")
    try {
      await createWalkIn({
        fullName: String(form.get("fullName") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        service,
        guests: Number(form.get("guests") ?? 1),
        roomId: service === "Phòng nghỉ" && form.get("roomId") ? Number(form.get("roomId")) : null,
        note: String(form.get("note") ?? "").trim(),
      })
      event.currentTarget.reset()
      closeForm()
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tiếp nhận khách")
    } finally { setSaving(false) }
  }

  const setStatus = async (id: number, status: GuestStatus) => {
    try { await updateWalkIn(id, { status }); await loadData() }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái") }
  }

  const removeRow = async (id: number) => {
    if (!window.confirm("Xóa lượt khách vãng lai này?")) return
    try { await deleteWalkIn(id); await loadData() }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể xóa lượt khách") }
  }

  return (
    <AdminRoomLayout
      eyebrow="SPRINT 2 · US.08"
      title="Tiếp nhận khách vãng lai"
      subtitle="Đúng Product Backlog US.08: Admin ghi nhận khách đến trực tiếp không có lịch. Backend nhóm chưa có module walk-ins nên Sprint 2 tạm lưu dữ liệu trên frontend."
      primaryAction={<button className="admin-primary-button" type="button" onClick={() => setShowForm(true)}>＋ Tiếp nhận khách</button>}
    >
      <section className="admin-s2-stats"><article><span>Tổng lượt ghi nhận</span><strong>{stats.total}</strong><small>Dữ liệu Sprint 2</small></article><article><span>Chờ tiếp nhận</span><strong>{stats.waiting}</strong><small>Cần xử lý</small></article><article><span>Đang phục vụ</span><strong>{stats.serving}</strong><small>Đang hoạt động</small></article></section>
      {error && <p className="booking-form-error">{error}</p>}

      {showForm && <section className="admin-s2-form-card"><div className="admin-s2-section-heading"><div><span>BIỂU MẪU TIẾP NHẬN</span><h2>Ghi nhận khách vãng lai</h2></div><button className="admin-secondary-button" type="button" onClick={closeForm}>Đóng</button></div>
        <form className="admin-s2-form" onSubmit={addGuest}>
          <label><span>Họ và tên *</span><input required name="fullName" placeholder="Nhập tên khách" /></label>
          <label><span>Số điện thoại *</span><input required name="phone" type="tel" pattern="[0-9 +().-]{9,15}" placeholder="09xx xxx xxx" /></label>
          <label><span>Dịch vụ *</span><select value={service} onChange={(e) => setService(e.target.value as ServiceType)}><option value="Phòng nghỉ">Phòng nghỉ</option><option value="Nhà hàng">Nhà hàng</option></select></label>
          <label><span>Số khách *</span><input required name="guests" type="number" min="1" defaultValue="1" /></label>
          {service === "Phòng nghỉ" && <label><span>Phòng</span><select name="roomId"><option value="">Chưa chọn phòng</option>{rooms.map((room) => <option value={room.id} key={room.id}>{room.name} · {room.code}</option>)}</select></label>}
          <label className="admin-s2-full"><span>Ghi chú</span><textarea name="note" rows={4} placeholder="Nhu cầu hoặc ghi chú của khách..." /></label>
          <div className="admin-s2-form-actions admin-s2-full"><button className="admin-secondary-button" type="button" onClick={closeForm}>Hủy</button><button className="admin-primary-button" disabled={saving} type="submit">{saving ? "Đang lưu..." : "Lưu thông tin khách"}</button></div>
        </form>
      </section>}

      <section className="admin-s2-table-card"><div className="admin-s2-section-heading"><div><span>DANH SÁCH TRONG NGÀY</span><h2>Khách vãng lai đã ghi nhận</h2></div><label className="admin-room-search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tên, SĐT, mã..." /></label></div>
        <div className="admin-s2-table-wrap"><table className="admin-s2-table"><thead><tr><th>Mã</th><th>Khách hàng</th><th>Dịch vụ</th><th>Số khách</th><th>Ghi chú</th><th>Trạng thái</th><th /></tr></thead><tbody>{filteredRows.map((item) => <tr key={item.id}><td><strong>{item.code}</strong></td><td><strong>{item.fullName}</strong><small>{item.phone}</small></td><td>{item.service}</td><td>{item.guests}</td><td>{item.note || "—"}</td><td><select className="admin-s2-status" value={item.status} onChange={(e) => void setStatus(item.id, e.target.value as GuestStatus)}><option value="Chờ tiếp nhận">Chờ tiếp nhận</option><option value="Đang phục vụ">Đang phục vụ</option><option value="Hoàn tất">Hoàn tất</option></select></td><td><button className="admin-icon-button danger" type="button" onClick={() => void removeRow(item.id)} title="Xóa">⌫</button></td></tr>)}</tbody></table></div>
        {filteredRows.length === 0 && <div className="admin-room-empty"><strong>Không có kết quả phù hợp</strong><span>Hãy thử một từ khóa khác.</span></div>}
      </section>
    </AdminRoomLayout>
  )
}
