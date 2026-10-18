import { useEffect, useMemo, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import AdminFormModal from "@/components/admin/AdminFormModal"
import RecruitmentCreateForm from "@/components/admin/RecruitmentCreateForm"
import DeleteRecruitmentDialog from "@/components/admin/DeleteRecruitmentDialog"
import { routes } from "@/config/routes"
import type { RecruitmentRecord } from "@/data/recruitmentPrototype"
import {
  deleteRecruitment,
  employmentTypeLabel,
  formatRecruitmentSalary,
  getRecruitments,
  normalizeEmploymentType,
  type RecruitmentDataSource,
} from "@/services/recruitmentApi"


function compareNewestIdFirst(
  a: { id: string | number },
  b: { id: string | number },
) {
  return String(b.id).localeCompare(String(a.id), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

function sourceLabel(_source: RecruitmentDataSource) {
  return "Dữ liệu backend"
}

export default function AdminRecruitmentsPage() {
  const [items, setItems] = useState<RecruitmentRecord[]>([])
  const [source, setSource] = useState<RecruitmentDataSource>("api")
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [toDelete, setToDelete] = useState<RecruitmentRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const loadItems = async () => {
    setLoading(true)

    try {
      const result = await getRecruitments()
      setItems([...result.items].sort(compareNewestIdFirst))
      setSource(result.source)
      setError("")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách tuyển dụng.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
  }, [])

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")
    if (!keyword) return items

    return items.filter((item) =>
      [
        item.title,
        employmentTypeLabel(item.type),
        item.location,
        item.salary,
        item.description,
      ]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword),
    )
  }, [items, query])

  const locations = new Set(
    items.map((item) => item.location).filter(Boolean),
  )

  const fullTime = items.filter(
    (item) => normalizeEmploymentType(item.type) === "fulltime",
  ).length

  const handleDelete = async (item: RecruitmentRecord) => {
    setDeleting(true)

    try {
      await deleteRecruitment(item.id)
      setToDelete(null)
      setNotice(`Đã xóa vị trí “${item.title}” khỏi backend.`)
      await loadItems()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể xóa tuyển dụng.",
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="TUYỂN DỤNG"
      title="Quản lý danh sách tuyển dụng"
      subtitle="Thêm, xem, sửa và xóa thông tin tuyển dụng."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={() => setShowCreate(true)}
        >
          + Thêm tuyển dụng
        </button>
      }
    >
      <section
        className="admin-room-stats"
        aria-label="Tổng quan tuyển dụng"
      >
        <article>
          <span>Tổng vị trí</span>
          <strong>{items.length}</strong>
          <small>{sourceLabel(source)}</small>
        </article>
        <article>
          <span>Toàn thời gian</span>
          <strong>{fullTime}</strong>
          <small>Trong danh sách hiện tại</small>
        </article>
        <article>
          <span>Khu vực tuyển</span>
          <strong>{locations.size}</strong>
          <small>Địa điểm khác nhau</small>
        </article>
      </section>

      <section className="admin-room-panel">
        <div className="admin-room-toolbar admin-recruitment-toolbar">
          <label className="admin-room-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Tìm kiếm tuyển dụng"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo vị trí, loại công việc, địa điểm..."
            />
          </label>

          <span className="admin-room-result-count">
            {filteredItems.length} kết quả
          </span>
        </div>

        {notice && (
          <div className="admin-room-inline-notice">
            <span>✓</span>
            {notice}
            <button type="button" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="admin-room-form-notice error">⚠ {error}</div>
        )}

        {loading && (
          <div className="admin-room-empty">
            <strong>Đang tải danh sách tuyển dụng...</strong>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-recruitment-table">
              <thead>
                <tr>
                  <th>Vị trí tuyển dụng</th>
                  <th>Hình thức</th>
                  <th>Địa điểm</th>
                  <th>Lương</th>
                  <th>Mô tả</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <small>{item.id}</small>
                    </td>
                    <td>{employmentTypeLabel(item.type)}</td>
                    <td>{item.location || "—"}</td>
                    <td>
                      <strong className="admin-recruitment-salary">
                        {formatRecruitmentSalary(item.salary)}
                      </strong>
                    </td>
                    <td>
                      <span className="admin-recruitment-description">
                        {item.description || "Chưa có mô tả"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-room-row-actions">
                        <a
                          className="admin-icon-button"
                          href={`${routes.adminRecruitmentEdit}?id=${encodeURIComponent(
                            item.id,
                          )}`}
                          aria-label={`Sửa ${item.title}`}
                          title="Sửa tuyển dụng"
                        >
                          ✎
                        </a>

                        <button
                          className="admin-icon-button danger"
                          type="button"
                          onClick={() => setToDelete(item)}
                          aria-label={`Xóa ${item.title}`}
                          title="Xóa tuyển dụng"
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
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="admin-room-empty">
            <strong>Chưa có thông tin tuyển dụng</strong>
            <span>
              Bấm “+ Thêm tuyển dụng” để tạo vị trí tuyển dụng mới.
            </span>
          </div>
        )}
      </section>

      <AdminFormModal
        open={showCreate}
        eyebrow="TUYỂN DỤNG"
        title="Thêm thông tin tuyển dụng"
        size="medium"
        onClose={() => setShowCreate(false)}
      >
        <RecruitmentCreateForm
          onCancel={() => setShowCreate(false)}
          onSaved={async () => {
            setShowCreate(false)
            setNotice("Đã thêm vị trí tuyển dụng mới.")
            await loadItems()
          }}
        />
      </AdminFormModal>

      <DeleteRecruitmentDialog
        recruitment={toDelete}
        deleting={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={(item) => void handleDelete(item)}
      />
    </AdminRoomLayout>
  )
}
