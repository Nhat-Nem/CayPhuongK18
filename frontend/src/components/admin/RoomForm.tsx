import { useState, type ChangeEvent, type FormEvent } from "react"
import { routes } from "@/config/routes"
import { resolveImageSource } from "@/config/assets"
import {
  getRoomStatusLabel,
  type RoomPrototype,
  type RoomStatus,
} from "@/data/roomPrototype"
import { createRoom, getRooms, updateRoom } from "@/services/roomApi"
import { fileToRoomImage } from "@/utils/roomImage"

export type RoomFormValues = {
  code: string
  name: string
  type: string
  price: string
  status: RoomStatus
  capacity: string
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
  status: room?.status ?? "AVAILABLE",
  capacity: room ? String(room.capacity) : "2",
  description: room?.description ?? "",
  primaryImage: room?.images[0] ?? "8bb71.png",
  secondaryImage: room?.images[1] ?? "a0b15.png",
})

export default function RoomForm({ mode, room }: RoomFormProps) {
  const [values, setValues] = useState<RoomFormValues>(() =>
    createInitialValues(room),
  )
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [processingImage, setProcessingImage] = useState<
    "primaryImage" | "secondaryImage" | null
  >(null)

  const updateField = (field: keyof RoomFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (error) setError("")
  }

  const handleImageChange = async (
    field: "primaryImage" | "secondaryImage",
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setProcessingImage(field)

    try {
      const imageData = await fileToRoomImage(file)
      updateField(field, imageData)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý ảnh đã chọn.",
      )
      event.target.value = ""
    } finally {
      setProcessingImage(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (processingImage) {
      setError("Vui lòng chờ xử lý ảnh hoàn tất trước khi lưu phòng.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const rooms = await getRooms()
      const duplicate = rooms.some(
        (item) =>
          item.code.trim().toLocaleLowerCase("vi") ===
            values.code.trim().toLocaleLowerCase("vi") &&
          item.id !== room?.id,
      )

      if (duplicate) {
        throw new Error(`Mã phòng ${values.code.trim()} đã tồn tại.`)
      }

      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        type: values.type,
        price: Number(values.price),
        // Backend chỉ nhận giá trị máy đọc được, không gửi chuỗi hiển thị tiếng Việt.
        status: values.status,
        capacity: Number(values.capacity),
        description: values.description.trim(),
        primaryImage: values.primaryImage || "8bb71.png",
        secondaryImage:
          values.secondaryImage || values.primaryImage || "a0b15.png",
      }

      if (mode === "create") {
        await createRoom(payload)
      } else if (room) {
        await updateRoom(room.id, payload)
      }

      window.location.href = `${routes.adminRooms}?saved=${
        mode === "create" ? "created" : "updated"
      }`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu phòng")
    } finally {
      setSaving(false)
    }
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
            <input
              required
              value={values.code}
              onChange={(e) => updateField("code", e.target.value)}
              placeholder="Ví dụ: P004"
            />
          </label>

          <label>
            <span>Tên phòng *</span>
            <input
              required
              value={values.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ví dụ: Phòng Deluxe"
            />
          </label>

          <label>
            <span>Loại phòng *</span>
            <select
              value={values.type}
              onChange={(e) => updateField("type", e.target.value)}
            >
              <option>Deluxe</option>
              <option>Glamping</option>
              <option>Family</option>
              <option>Standard</option>
            </select>
          </label>

          <label>
            <span>Giá phòng / đêm *</span>
            <div className="admin-room-input-suffix">
              <input
                required
                min="1"
                type="number"
                value={values.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="850000"
              />
              <strong>VNĐ</strong>
            </div>
          </label>

          <label>
            <span>Trạng thái *</span>
            <select
              value={values.status}
              onChange={(e) =>
                updateField("status", e.target.value as RoomStatus)
              }
            >
              <option value="AVAILABLE">
                {getRoomStatusLabel("AVAILABLE")}
              </option>
              <option value="UNAVAILABLE">
                {getRoomStatusLabel("UNAVAILABLE")}
              </option>
            </select>
            <small>
              Backend lưu AVAILABLE / UNAVAILABLE; giao diện chỉ render nhãn tiếng
              Việt.
            </small>
          </label>

          <label>
            <span>Sức chứa *</span>
            <div className="admin-room-input-suffix">
              <input
                required
                min="1"
                type="number"
                value={values.capacity}
                onChange={(e) => updateField("capacity", e.target.value)}
              />
              <strong>khách</strong>
            </div>
          </label>
        </div>
      </section>

      <section className="admin-room-form-card">
        <div className="admin-room-form-heading">
          <div>
            <span>02</span>
            <div>
              <h2>Mô tả phòng</h2>
              <p>
                Đã bỏ Loại giường và Tầm nhìn để khớp với dữ liệu phòng ở backend.
              </p>
            </div>
          </div>
        </div>

        <div className="admin-room-form-grid">
          <label className="admin-room-form-full">
            <span>Mô tả *</span>
            <textarea
              required
              maxLength={500}
              rows={5}
              value={values.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
            <small>{values.description.length}/500 ký tự</small>
          </label>
        </div>
      </section>

      <section className="admin-room-form-card">
        <div className="admin-room-form-heading">
          <div>
            <span>03</span>
            <div>
              <h2>Hình ảnh phòng</h2>
              <p>Chọn ảnh trực tiếp từ máy tính. Frontend tự nén ảnh trước khi lưu.</p>
            </div>
          </div>
        </div>

        <div className="admin-room-image-grid">
          <label className="admin-room-image-picker">
            <span>Ảnh chính *</span>
            <div className="admin-room-image-preview">
              <img
                src={resolveImageSource(values.primaryImage)}
                alt="Xem trước ảnh chính"
              />
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                void handleImageChange("primaryImage", event)
              }
            />
            <small>
              {processingImage === "primaryImage"
                ? "Đang xử lý ảnh..."
                : "JPG, PNG hoặc WEBP · tối đa 8 MB"}
            </small>
          </label>

          <label className="admin-room-image-picker">
            <span>Ảnh phụ</span>
            <div className="admin-room-image-preview">
              <img
                src={resolveImageSource(values.secondaryImage)}
                alt="Xem trước ảnh phụ"
              />
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                void handleImageChange("secondaryImage", event)
              }
            />
            <small>
              {processingImage === "secondaryImage"
                ? "Đang xử lý ảnh..."
                : "JPG, PNG hoặc WEBP · tối đa 8 MB"}
            </small>
          </label>
        </div>
      </section>

      {error && (
        <div className="admin-room-form-notice error">⚠ {error}</div>
      )}

      <div className="admin-room-form-actions">
        <a className="admin-secondary-button" href={routes.adminRooms}>
          Hủy
        </a>
        <button
          className="admin-primary-button"
          disabled={saving || Boolean(processingImage)}
          type="submit"
        >
          {saving
            ? "Đang lưu..."
            : processingImage
              ? "Đang xử lý ảnh..."
              : mode === "create"
                ? "Lưu phòng mới"
                : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  )
}
