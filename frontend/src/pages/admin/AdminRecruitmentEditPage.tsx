import { useEffect, useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { routes } from "@/config/routes"
import type { RecruitmentRecord } from "@/data/recruitmentPrototype"
import {
  getRecruitmentApiPath,
  getRecruitmentById,
  updateRecruitment,
  type RecruitmentDataSource,
} from "@/services/recruitmentApi"

export default function AdminRecruitmentEditPage() {
  const id = new URLSearchParams(window.location.search).get("id") ?? ""
  const [item, setItem] = useState<RecruitmentRecord | null>(null)
  const [source, setSource] = useState<RecruitmentDataSource>("prototype")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Thiếu ID thông tin tuyển dụng.")
      setLoading(false)
      return
    }

    getRecruitmentById(id)
      .then((result) => {
        setItem(result.item)
        setSource(result.source)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!item) return

    setSaving(true)
    setError("")
    try {
      const result = await updateRecruitment(item.id, {
        title: item.title.trim(),
        type: item.type.trim(),
        location: item.location.trim(),
        description: item.description.trim(),
      })
      window.location.href = `${routes.adminRecruitments}?saved=updated&source=${result.source}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật tuyển dụng.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminRoomLayout
        eyebrow="US.19 · TUYỂN DỤNG"
        title="Đang tải thông tin tuyển dụng"
        subtitle="Đang chuẩn bị dữ liệu cho giao diện chỉnh sửa."
        primaryAction={
          <a className="admin-text-link" href={routes.adminRecruitments}>
            ← Danh sách tuyển dụng
          </a>
        }
      >
        <div className="admin-room-empty">
          <strong>Đang tải...</strong>
        </div>
      </AdminRoomLayout>
    )
  }

  if (!item) {
    return (
      <AdminRoomLayout
        eyebrow="US.19 · TUYỂN DỤNG"
        title="Không tìm thấy tuyển dụng"
        subtitle={error || "Thông tin cần sửa không tồn tại."}
        primaryAction={
          <a className="admin-text-link" href={routes.adminRecruitments}>
            ← Danh sách tuyển dụng
          </a>
        }
      >
        <div className="admin-room-empty">
          <strong>Không có dữ liệu để chỉnh sửa.</strong>
        </div>
      </AdminRoomLayout>
    )
  }

  return (
    <AdminRoomLayout
      eyebrow="US.19 · TUYỂN DỤNG"
      title="Sửa thông tin tuyển dụng"
      subtitle="T.09–T.10 · Chỉnh sửa nội dung vị trí tuyển dụng và lưu thay đổi."
      primaryAction={
        <a className="admin-text-link" href={routes.adminRecruitments}>
          ← Danh sách tuyển dụng
        </a>
      }
    >
      {source === "prototype" && (
        <div className="admin-recruitment-api-note">
          <span>Khi backend có {getRecruitmentApiPath()}, trang này sẽ tự ưu tiên dữ liệu API.</span>
        </div>
      )}

      <section className="admin-recruitment-edit-card">
        <div className="admin-s2-section-heading">
          <div>
            <span>THÔNG TIN VỊ TRÍ</span>
            <h2>{item.title}</h2>
          </div>
          <small>Mã: {item.id}</small>
        </div>

        {error && <div className="admin-room-form-notice error">⚠ {error}</div>}

        <form className="admin-recruitment-form" onSubmit={handleSubmit}>
          <label className="admin-recruitment-full">
            <span>Tên vị trí tuyển dụng</span>
            <input
              required
              value={item.title}
              onChange={(event) =>
                setItem((current) =>
                  current ? { ...current, title: event.target.value } : current,
                )
              }
              placeholder="Nhập tên vị trí"
            />
          </label>

          <label>
            <span>Hình thức làm việc</span>
            <input
              required
              value={item.type}
              onChange={(event) =>
                setItem((current) =>
                  current ? { ...current, type: event.target.value } : current,
                )
              }
              placeholder="Ví dụ: Toàn thời gian"
            />
          </label>

          <label>
            <span>Địa điểm</span>
            <input
              required
              value={item.location}
              onChange={(event) =>
                setItem((current) =>
                  current
                    ? { ...current, location: event.target.value }
                    : current,
                )
              }
              placeholder="Ví dụ: Tây Ninh"
            />
          </label>

          <label className="admin-recruitment-full">
            <span>Mô tả công việc</span>
            <textarea
              required
              value={item.description}
              onChange={(event) =>
                setItem((current) =>
                  current
                    ? { ...current, description: event.target.value }
                    : current,
                )
              }
              placeholder="Mô tả ngắn về vị trí tuyển dụng"
            />
          </label>

          <div className="admin-recruitment-form-actions admin-recruitment-full">
            <a className="admin-secondary-button" href={routes.adminRecruitments}>
              Hủy
            </a>
            <button className="admin-primary-button" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </section>
    </AdminRoomLayout>
  )
}
