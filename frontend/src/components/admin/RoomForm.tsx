import { useState, type FormEvent } from "react"
import { routes } from "@/config/routes"
import type { RoomPrototype, RoomStatus } from "@/data/roomPrototype"
import { addRoom, isRoomCodeTaken, updateRoom } from "@/utils/roomStore"

export type RoomFormValues = {
  code: string
  name: string
  type: string
  price: string
  status: RoomStatus
  capacity: string
  bed: string
  view: string
  description: string
  primaryImage: string
  secondaryImage: string
}

interface RoomFormProps {
  mode: "create" | "edit"
  room?: RoomPrototype
}

const createInitialValues = (room?: RoomPrototype): RoomFormValues => ({
  code: room?.code ?? "",
  name: room?.name ?? "",
  type: room?.type ?? "Deluxe",
  price: room ? String(room.price) : "",
  status: room?.status ?? "Đang hoạt động",
  capacity: room ? String(room.capacity) : "2",
  bed: room?.bed ?? "King-size",
  view: room?.view ?? "",
  description: room?.description ?? "",
  primaryImage: room?.images[0] ?? "8bb71.png",
  secondaryImage: room?.images[1] ?? "a0b15.png",
})

const createRoomId = (code: string) =>
  `room-${code.trim().toLocaleLowerCase("vi").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`

export default function RoomForm({ mode, room }: RoomFormProps) {
  const [values, setValues] = useState<RoomFormValues>(() => createInitialValues(room))
  const [error, setError] = useState("")

  const updateField = (field: keyof RoomFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (error) setError("")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isRoomCodeTaken(values.code, room?.id)) {
      setError(`Mã phòng ${values.code.trim()} đã tồn tại.`)
      return
    }

    const nextRoom: RoomPrototype = {
      id: room?.id ?? createRoomId(values.code),
      code: values.code.trim(),
      name: values.name.trim(),
      type: values.type,
      price: Number(values.price),
      status: values.status,
      capacity: Number(values.capacity),
      bed: values.bed.trim(),
      view: values.view.trim(),
      description: values.description.trim(),
      images: [values.primaryImage.trim() || "8bb71.png", values.secondaryImage.trim() || "a0b15.png"],
    }

    if (mode === "create") addRoom(nextRoom)
    else updateRoom(nextRoom)

    window.location.href = `${routes.adminRooms}?saved=${mode === "create" ? "created" : "updated"}`
  }

  return (
    <form className="admin-room-form" onSubmit={handleSubmit}>
      <section className="admin-room-form-card">
        <div className="admin-room-form-heading">
          <div>
            <span>01</span>
            <div>
              <h2>Thông tin cơ bản</h2>
              <p>Các trường chính dùng để nhận diện và hiển thị phòng.</p>
            </div>
          </div>
          <small>* Bắt buộc</small>
        </div>

        <div className="admin-room-form-grid">
          <label>
            <span>Mã phòng *</span>
            <input required value={values.code} onChange={(event) => updateField("code", event.target.value)} placeholder="Ví dụ: P004" />
          </label>
          <label>
            <span>Tên phòng *</span>
            <input required value={values.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Ví dụ: Phòng Deluxe Hướng Vườn" />
          </label>
          <label>
            <span>Loại phòng *</span>
            <select value={values.type} onChange={(event) => updateField("type", event.target.value)}>
              <option>Deluxe</option><option>Glamping</option><option>Family</option><option>Standard</option>
            </select>
          </label>
          <label>
            <span>Giá phòng / đêm *</span>
            <div className="admin-room-input-suffix">
              <input required min="1" inputMode="numeric" type="number" value={values.price} onChange={(event) => updateField("price", event.target.value)} placeholder="850000" />
              <strong>VNĐ</strong>
            </div>
          </label>
          <label>
            <span>Trạng thái *</span>
            <select value={values.status} onChange={(event) => updateField("status", event.target.value as RoomStatus)}>
              <option>Đang hoạt động</option><option>Tạm ngưng</option>
            </select>
          </label>
          <label>
            <span>Sức chứa *</span>
            <div className="admin-room-input-suffix">
              <input required min="1" type="number" value={values.capacity} onChange={(event) => updateField("capacity", event.target.value)} />
              <strong>khách</strong>
            </div>
          </label>
        </div>
      </section>

      <section className="admin-room-form-card">
        <div className="admin-room-form-heading">
          <div><span>02</span><div><h2>Đặc điểm & mô tả</h2><p>Bổ sung thông tin giúp khách hàng lựa chọn phòng phù hợp.</p></div></div>
        </div>
        <div className="admin-room-form-grid">
          <label><span>Loại giường</span><input value={values.bed} onChange={(event) => updateField("bed", event.target.value)} /></label>
          <label><span>Tầm nhìn</span><input value={values.view} onChange={(event) => updateField("view", event.target.value)} placeholder="Ví dụ: Hướng núi" /></label>
          <label className="admin-room-form-full">
            <span>Mô tả *</span>
            <textarea required maxLength={500} rows={5} value={values.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Mô tả không gian, tiện nghi nổi bật và đối tượng phù hợp..." />
            <small>{values.description.length}/500 ký tự</small>
          </label>
        </div>
      </section>

      <section className="admin-room-form-card">
        <div className="admin-room-form-heading">
          <div><span>03</span><div><h2>Hình ảnh phòng</h2><p>Nhập tên ảnh có sẵn trong thư mục public/assets.</p></div></div>
        </div>
        <div className="admin-room-form-grid">
          <label><span>Ảnh chính</span><input value={values.primaryImage} onChange={(event) => updateField("primaryImage", event.target.value)} placeholder="8bb71.png" /></label>
          <label><span>Ảnh phụ</span><input value={values.secondaryImage} onChange={(event) => updateField("secondaryImage", event.target.value)} placeholder="a0b15.png" /></label>
        </div>
      </section>

      {error && <div className="admin-room-form-notice error">⚠ {error}</div>}

      <div className="admin-room-form-actions">
        <a className="admin-secondary-button" href={routes.adminRooms}>Hủy</a>
        <button className="admin-primary-button" type="submit">{mode === "create" ? "Lưu phòng mới" : "Lưu thay đổi"}</button>
      </div>
    </form>
  )
}
