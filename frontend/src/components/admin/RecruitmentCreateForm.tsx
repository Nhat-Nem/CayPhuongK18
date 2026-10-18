import { useState, type FormEvent } from "react"
import { routes } from "@/config/routes"
import { createRecruitment } from "@/services/recruitmentApi"

type RecruitmentCreateFormProps = {
  onSaved?: () => void | Promise<void>
  onCancel?: () => void
}

export default function RecruitmentCreateForm({
  onSaved,
  onCancel,
}: RecruitmentCreateFormProps) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState("fulltime")
  const [location, setLocation] = useState("Tây Ninh")
  const [salary, setSalary] = useState("")
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
        type,
        location: location.trim(),
        salary: salary.trim(),
        description: description.trim(),
      })

      if (onSaved) {
        await onSaved()
        return
      }

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
    <form className="admin-recruitment-form" onSubmit={handleSubmit}>
      <label className="admin-recruitment-full">
        <span>Tên vị trí tuyển dụng *</span>
        <input
          required
          maxLength={255}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ví dụ: Nhân viên lễ tân"
        />
      </label>

      <label>
        <span>Hình thức làm việc *</span>
        <select
          required
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="fulltime">Toàn thời gian</option>
          <option value="part-time">Bán thời gian</option>
        </select>
      </label>

      <label>
        <span>Địa điểm *</span>
        <input
          required
          maxLength={255}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Ví dụ: Tây Ninh"
        />
      </label>

      <label className="admin-recruitment-full">
        <span>Lương (VNĐ/tháng)</span>
        <input
          type="number"
          min="0"
          step="1000"
          inputMode="numeric"
          value={salary}
          onChange={(event) => setSalary(event.target.value)}
          placeholder="Ví dụ: 8000000"
        />
        <small className="admin-recruitment-field-hint">
          Để trống nếu muốn hiển thị “Thỏa thuận”.
        </small>
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

      {error && (
        <div className="admin-room-form-notice error admin-recruitment-full">
          ⚠ {error}
        </div>
      )}

      <div className="admin-recruitment-form-actions admin-recruitment-full">
        {onCancel ? (
          <button
            className="admin-secondary-button"
            type="button"
            onClick={onCancel}
          >
            Hủy
          </button>
        ) : (
          <a className="admin-secondary-button" href={routes.adminRecruitments}>
            Hủy
          </a>
        )}

        <button
          className="admin-primary-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Đang lưu..." : "+ Thêm tuyển dụng"}
        </button>
      </div>
    </form>
  )
}
