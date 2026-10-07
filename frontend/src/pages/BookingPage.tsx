import { useMemo, useState, type FormEvent } from "react"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { formatRoomPrice } from "@/data/roomPrototype"
import { getPublicRooms } from "@/utils/roomStore"
import { addBookingRequest, type BookingRequest } from "@/utils/bookingStore"

export default function BookingPage() {
  const rooms = getPublicRooms()
  const roomFromUrl = new URLSearchParams(window.location.search).get("room")
  const defaultRoom = rooms.some((room) => room.id === roomFromUrl) ? roomFromUrl! : rooms[0]?.id ?? ""

  const [roomId, setRoomId] = useState(defaultRoom)
  const [submittedId, setSubmittedId] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [dateError, setDateError] = useState("")
  const selectedRoom = useMemo(() => rooms.find((room) => room.id === roomId), [roomId, rooms])

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roomId) return
    if (checkIn && checkOut && checkOut <= checkIn) {
      setDateError("Ngày trả phòng phải sau ngày nhận phòng.")
      return
    }

    const form = new FormData(event.currentTarget)
    const booking: BookingRequest = {
      id: `BK-${String(Date.now()).slice(-8)}`,
      fullName: String(form.get("fullName") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      checkIn,
      checkOut,
      guests: Number(form.get("guests") ?? 1),
      roomId,
      note: String(form.get("note") ?? "").trim(),
      createdAt: new Date().toISOString(),
    }

    addBookingRequest(booking)
    setDateError("")
    setSubmittedId(booking.id)
  }

  return (
    <Shell>
      <Hero image="e4fc5.png" title="ĐẶT PHÒNG" subtitle="Gửi nhu cầu lưu trú để Cây Phượng K18 có thể chuẩn bị hạng phòng phù hợp cho chuyến đi của bạn." />
      <section className="booking-prototype-section">
        <div className="booking-prototype-heading"><div><p className="eyebrow">SPRINT 2 · US.06</p><h2>Yêu cầu đặt phòng</h2></div><p>Biểu mẫu đã được hiện thực ở frontend. Yêu cầu được lưu tạm trên trình duyệt và có thể thay bằng API tiếp nhận đặt phòng khi backend hoàn thành.</p></div>
        <div className="booking-prototype-layout">
          <aside className="booking-room-summary"><span className="booking-step">01 · CHỌN HẠNG PHÒNG</span>{selectedRoom ? <><h3>{selectedRoom.name}</h3><p>{selectedRoom.description}</p><dl><div><dt>Mã phòng</dt><dd>{selectedRoom.code}</dd></div><div><dt>Sức chứa</dt><dd>{selectedRoom.capacity} khách</dd></div><div><dt>Giá tham khảo</dt><dd>{formatRoomPrice(selectedRoom.price)} / đêm</dd></div></dl></> : <p>Hiện chưa có phòng đang hoạt động.</p>}<a href="/phong">← Xem lại danh sách phòng</a></aside>
          <div className="booking-form-card">
            {submittedId ? (
              <div className="booking-success" role="status"><span>✓</span><h3>Đã ghi nhận yêu cầu đặt phòng</h3><p>Mã yêu cầu: <strong>{submittedId}</strong>. Đây là bản frontend; nhân viên backend sẽ nối dữ liệu này với API sau.</p><button type="button" onClick={() => setSubmittedId("")}>Tạo yêu cầu khác</button></div>
            ) : (
              <form className="booking-form" onSubmit={submitBooking}>
                <div className="booking-form-title"><span className="booking-step">02 · THÔNG TIN LƯU TRÚ</span><h3>Điền thông tin đặt phòng</h3><p>Các trường có dấu * là thông tin bắt buộc.</p></div>
                <label className="booking-field booking-field-full"><span>Hạng phòng *</span><select required value={roomId} onChange={(event) => setRoomId(event.target.value)} disabled={rooms.length === 0}>{rooms.map((room) => <option value={room.id} key={room.id}>{room.name} — {formatRoomPrice(room.price)} / đêm</option>)}</select></label>
                <label className="booking-field"><span>Ngày nhận phòng *</span><input required type="date" name="checkIn" value={checkIn} min={new Date().toISOString().slice(0,10)} onChange={(event) => {setCheckIn(event.target.value);setDateError("")}} /></label>
                <label className="booking-field"><span>Ngày trả phòng *</span><input required type="date" name="checkOut" value={checkOut} min={checkIn || undefined} onChange={(event) => {setCheckOut(event.target.value);setDateError("")}} /></label>
                <label className="booking-field"><span>Số khách *</span><input required min="1" max={selectedRoom?.capacity ?? 12} type="number" name="guests" defaultValue={Math.min(2, selectedRoom?.capacity ?? 2)} /></label>
                <label className="booking-field"><span>Họ và tên *</span><input required name="fullName" autoComplete="name" placeholder="Nguyễn Văn A" /></label>
                <label className="booking-field"><span>Số điện thoại *</span><input required type="tel" name="phone" autoComplete="tel" pattern="[0-9 +().-]{9,15}" placeholder="09xx xxx xxx" /></label>
                <label className="booking-field"><span>Email *</span><input required type="email" name="email" autoComplete="email" placeholder="example@email.com" /></label>
                <label className="booking-field booking-field-full"><span>Yêu cầu đặc biệt</span><textarea name="note" rows={5} placeholder="Ví dụ: nhận phòng trễ, cần thêm nệm, ưu tiên tầng trệt..." /></label>
                {dateError && <p className="booking-form-error" role="alert">{dateError}</p>}
                <div className="booking-form-footer booking-field-full"><p>Gửi biểu mẫu không đồng nghĩa phòng đã được xác nhận. Nhân viên sẽ liên hệ lại sau khi kiểm tra tình trạng phòng.</p><button type="submit" disabled={!roomId}>Gửi yêu cầu đặt phòng <span>→</span></button></div>
              </form>
            )}
          </div>
        </div>
      </section>
    </Shell>
  )
}
