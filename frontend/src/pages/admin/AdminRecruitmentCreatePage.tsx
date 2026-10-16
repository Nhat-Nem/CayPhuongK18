import { useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { routes } from "@/config/routes"
import {
  createRecruitment,
  getRecruitmentApiPath,
} from "@/services/recruitmentApi"

export default function AdminRecruitmentCreatePage() {
  const [title, setTitle] = useState("")
  const [type, setType] = useState("Toàn thời gian")
  const [location, setLocation] = useState("Tây Ninh")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const result = await createRecruitment({
        title: title.trim(),
        type: type.trim(),
        location: location.trim(),
        description: description.trim(),
      })

      window.location.href =
        `${routes.adminRecruitments}?saved=created&source=${result.source}`
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể thêm thông tin tuyển dụng.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="TUYỂN DỤNG"
      title="Thêm thông tin tuyển dụng"
      subtitle="Tạo vị trí tuyển dụng mới. Nội dung sau khi lưu sẽ xuất hiện trong danh sách Admin và trang Tuyển dụng dành cho khách."
      primaryAction={
        <a className="admin-text-link" href={routes.adminRecruitments}>
          ← Danh sách tuyển dụng
        </a>
      }
    >
      <div className="admin-recruitment-api-note">
        <span>Dữ liệu được lưu qua POST {getRecruitmentApiPath()}.</span>
      </div>

      <section className="admin-recruitment-edit-card">
        <div className="admin-s2-section-heading">
          <div>
            <span>THÔNG TIN VỊ TRÍ</span>
            <h2>Vị trí tuyển dụng mới</h2>
          </div>
        </div>

        {error && (
          <div className="admin-room-form-notice error">⚠ {error}</div>
        )}

        <form
          className="admin-recruitment-form"
          onSubmit={handleSubmit}
        >
          <label className="admin-recruitment-full">
            <span>Tên vị trí tuyển dụng *</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Nhân viên lễ tân"
            />
          </label>

          <label>
            <span>Hình thức làm việc *</span>
            <input
              required
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="Ví dụ: Toàn thời gian"
            />
          </label>

          <label>
            <span>Địa điểm *</span>
            <input
              required
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Ví dụ: Tây Ninh"
            />
          </label>

          <label className="admin-recruitment-full">
            <span>Mô tả công việc *</span>
            <textarea
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Nhập mô tả ngắn về vị trí tuyển dụng"
            />
          </label>

          <div className="admin-recruitment-form-actions admin-recruitment-full">
            <a
              className="admin-secondary-button"
              href={routes.adminRecruitments}
            >
              Hủy
            </a>

            <button
              className="admin-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "+ Thêm tuyển dụng"}
            </button>
          </div>
        </form>
      </section>
    </AdminRoomLayout>
  )
}
