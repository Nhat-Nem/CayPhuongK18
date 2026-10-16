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

const MAX_ROOM_IMAGES = 5
const MAX_SECONDARY_IMAGES = MAX_ROOM_IMAGES - 1

export type RoomFormValues = {
  code: string
  name: string
  type: string
  price: string
  status: RoomStatus
  capacity: string
  description: string
  primaryImage: string
  secondaryImages: string[]
}

type RoomTextField = Exclude<keyof RoomFormValues, "secondaryImages">

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
  primaryImage: room?.images[0] ?? "",
  secondaryImages: room?.images.slice(1, MAX_ROOM_IMAGES) ?? [],
})

export default function RoomForm({ mode, room }: RoomFormProps) {
  const [values, setValues] = useState<RoomFormValues>(() =>
    createInitialValues(room),
  )
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [processingImage, setProcessingImage] = useState<
    "primary" | "secondary" | null
  >(null)

  const updateField = (field: RoomTextField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    if (error) setError("")
  }

  const handlePrimaryImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError("")
    setProcessingImage("primary")

    try {
      const imageData = await fileToRoomImage(file)

      setValues((current) => ({
        ...current,
        primaryImage: imageData,
      }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý ảnh đã chọn.",
      )
    } finally {
      event.target.value = ""
      setProcessingImage(null)
    }
  }

  const handleSecondaryImagesChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const remaining = MAX_SECONDARY_IMAGES - values.secondaryImages.length

    if (remaining <= 0) {
      setError("Đã đủ 4 ảnh phụ. Một phòng được phép có tối đa 5 ảnh.")
      event.target.value = ""
      return
    }

    if (files.length > remaining) {
      setError(
        `Bạn chỉ có thể thêm ${remaining} ảnh phụ nữa (tối đa 5 ảnh/phòng).`,
      )
      event.target.value = ""
      return
    }

    setError("")
    setProcessingImage("secondary")

    try {
      const newImages: string[] = []

      for (const file of files) {
        newImages.push(await fileToRoomImage(file))
      }

      setValues((current) => ({
        ...current,
        secondaryImages: [
          ...current.secondaryImages,
          ...newImages,
        ].slice(0, MAX_SECONDARY_IMAGES),
      }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý ảnh đã chọn.",
      )
    } finally {
      event.target.value = ""
      setProcessingImage(null)
    }
  }

  const removeSecondaryImage = (index: number) => {
    setValues((current) => ({
      ...current,
      secondaryImages: current.secondaryImages.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    }))

    if (error) setError("")
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (processingImage) {
      setError("Vui lòng chờ xử lý ảnh hoàn tất trước khi lưu phòng.")
      return
    }

    if (!values.primaryImage) {
      setError("Vui lòng chọn 1 ảnh chính cho phòng.")
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
        status: values.status,
        capacity: Number(values.capacity),
        description: values.description.trim(),
        primaryImage: values.primaryImage,
        secondaryImages: values.secondaryImages.slice(
          0,
          MAX_SECONDARY_IMAGES,
        ),
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

  const totalImages =
    (values.primaryImage ? 1 : 0) + values.secondaryImages.length

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
              Backend lưu AVAILABLE / UNAVAILABLE; giao diện render nhãn tiếng
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
              <p>Bổ sung thông tin giúp khách hàng lựa chọn phòng phù hợp.</p>
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
              <p>
                1 ảnh chính + tối đa 4 ảnh phụ. Tổng cộng tối đa 5 ảnh/phòng.
              </p>
            </div>
          </div>
          <small>{totalImages}/{MAX_ROOM_IMAGES} ảnh</small>
        </div>

        <div className="admin-room-image-grid admin-room-image-grid--multi">
          <div className="admin-room-image-picker">
            <span>Ảnh chính *</span>

            <div className="admin-room-image-preview">
              {values.primaryImage ? (
                <img
                  src={resolveImageSource(values.primaryImage)}
                  alt="Xem trước ảnh chính"
                />
              ) : (
                <div className="admin-room-image-empty">
                  Chưa chọn ảnh chính
                </div>
              )}

              <strong className="admin-room-image-badge">Ảnh chính</strong>
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handlePrimaryImageChange(event)}
            />

            <small>
              {processingImage === "primary"
                ? "Đang xử lý ảnh..."
                : "JPG, PNG hoặc WEBP · tối đa 8 MB"}
            </small>
          </div>

          <div className="admin-room-secondary-images">
            <div className="admin-room-secondary-heading">
              <div>
                <strong>Ảnh phụ</strong>
                <span>
                  {values.secondaryImages.length}/{MAX_SECONDARY_IMAGES}
                </span>
              </div>

              <small>
                Có thể chọn nhiều ảnh cùng lúc. Carousel sẽ dùng toàn bộ ảnh.
              </small>
            </div>

            <div className="admin-room-secondary-grid">
              {values.secondaryImages.map((image, index) => (
                <div
                  className="admin-room-secondary-item"
                  key={`${image.slice(0, 40)}-${index}`}
                >
                  <img
                    src={resolveImageSource(image)}
                    alt={`Ảnh phụ ${index + 1}`}
                  />
                  <span>Ảnh phụ {index + 1}</span>

                  <button
                    type="button"
                    onClick={() => removeSecondaryImage(index)}
                    aria-label={`Xóa ảnh phụ ${index + 1}`}
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              ))}

              {values.secondaryImages.length === 0 && (
                <div className="admin-room-secondary-empty">
                  Chưa có ảnh phụ
                </div>
              )}
            </div>

            <label
              className={`admin-room-secondary-add ${
                values.secondaryImages.length >= MAX_SECONDARY_IMAGES
                  ? "disabled"
                  : ""
              }`}
            >
              <span>
                {values.secondaryImages.length >= MAX_SECONDARY_IMAGES
                  ? "Đã đủ 4 ảnh phụ"
                  : "+ Thêm ảnh phụ"}
              </span>

              <input
                type="file"
                multiple
                disabled={
                  values.secondaryImages.length >= MAX_SECONDARY_IMAGES ||
                  Boolean(processingImage)
                }
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  void handleSecondaryImagesChange(event)
                }
              />
            </label>

            <small className="admin-room-secondary-note">
              {processingImage === "secondary"
                ? "Đang xử lý ảnh phụ..."
                : `Còn ${
                    MAX_SECONDARY_IMAGES - values.secondaryImages.length
                  } vị trí ảnh phụ.`}
            </small>
          </div>
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
