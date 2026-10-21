import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import AdminFormModal from "@/components/admin/AdminFormModal"
import {
  createPromotion,
  deletePromotion,
  formatPromotionDate,
  getPromotions,
  promotionApplyTypeLabel,
  promotionStatus,
  promotionStatusLabel,
  updatePromotion,
  type PromotionApplyType,
  type PromotionRecord,
} from "@/services/promotionStore"

type FormState = {
  name: string
  discountPercent: string
  startDate: string
  endDate: string
  applyType: "1" | "2"
}

const emptyForm: FormState = {
  name: "",
  discountPercent: "",
  startDate: "",
  endDate: "",
  applyType: "1",
}

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<PromotionRecord[]>([])
  const [query, setQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const reload = async () => {
    setLoading(true)
    setError("")

    try {
      setItems(await getPromotions())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải khuyến mãi từ backend.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")
    if (!keyword) return items
    return items.filter((item) =>
      [item.name, promotionApplyTypeLabel(item.applyType)]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword),
    )
  }, [items, query])

  const activeCount = items.filter(
    (item) => promotionStatus(item) === "active",
  ).length
  const hotelCount = items.filter((item) => item.applyType === 1).length
  const restaurantCount = items.filter((item) => item.applyType === 2).length

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setShowForm(true)
  }

  const openEdit = (item: PromotionRecord) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      discountPercent: String(item.discountPercent),
      startDate: item.startDate,
      endDate: item.endDate,
      applyType: String(item.applyType) as "1" | "2",
    })
    setError("")
    setShowForm(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const percent = Number(form.discountPercent)
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên chương trình.")
      return
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      setError("Phần trăm giảm giá phải lớn hơn 0 và không vượt quá 100.")
      return
    }
    if (!form.startDate || !form.endDate) {
      setError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.")
      return
    }
    if (form.endDate <= form.startDate) {
      setError("Ngày kết thúc phải sau ngày bắt đầu.")
      return
    }

    const payload = {
      name: form.name.trim(),
      discountPercent: percent,
      startDate: form.startDate,
      endDate: form.endDate,
      applyType: Number(form.applyType) as PromotionApplyType,
    }

    setSaving(true)

    try {
      if (editingId) {
        await updatePromotion(editingId, payload)
        setNotice(`Đã cập nhật chương trình “${payload.name}”.`)
      } else {
        await createPromotion(payload)
        setNotice(`Đã thêm chương trình “${payload.name}”.`)
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await reload()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể lưu chương trình khuyến mãi.",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: PromotionRecord) => {
    if (!window.confirm(`Xóa chương trình “${item.name}”?`)) return

    setError("")
    try {
      await deletePromotion(item.id)
      setNotice(`Đã xóa chương trình “${item.name}”.`)
      await reload()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xóa chương trình khuyến mãi.",
      )
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="KHUYẾN MÃI"
      title="Quản lý khuyến mãi"
      subtitle="Thêm, sửa và xóa chương trình ưu đãi được lưu trực tiếp qua backend."
      primaryAction={
        <button className="admin-primary-button" type="button" onClick={openCreate}>
          + Thêm khuyến mãi
        </button>
      }
    >
      <section className="admin-room-stats" aria-label="Tổng quan khuyến mãi">
        <article>
          <span>Tổng chương trình</span>
          <strong>{items.length}</strong>
          <small>Trong database</small>
        </article>
        <article>
          <span>Đang áp dụng</span>
          <strong>{activeCount}</strong>
          <small>Theo thời gian chương trình</small>
        </article>
        <article>
          <span>Phạm vi áp dụng</span>
          <strong>{hotelCount} / {restaurantCount}</strong>
          <small>Khách sạn / Nhà hàng</small>
        </article>
      </section>

      {error && !showForm && (
        <div className="admin-room-form-notice error">⚠ {error}</div>
      )}

      <section className="admin-room-panel">
        <div className="admin-room-toolbar admin-promotion-toolbar">
          <label className="admin-room-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Tìm kiếm chương trình khuyến mãi"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên chương trình, hình thức áp dụng..."
            />
          </label>
          <span className="admin-room-result-count">{filteredItems.length} kết quả</span>
        </div>

        <div className="admin-promotion-storage-note">
          <strong>Backend:</strong>
          <span>Dữ liệu đang đồng bộ qua /api/v1/promotions.</span>
        </div>

        {notice && (
          <div className="admin-room-inline-notice">
            <span>✓</span>
            {notice}
            <button type="button" onClick={() => setNotice("")}>×</button>
          </div>
        )}

        {loading ? (
          <div className="admin-room-empty">
            <strong>Đang tải khuyến mãi...</strong>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-promotion-table">
              <thead>
                <tr>
                  <th>Chương trình</th>
                  <th>Giảm giá</th>
                  <th>Bắt đầu</th>
                  <th>Kết thúc</th>
                  <th>Áp dụng</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = promotionStatus(item)
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.name}</strong></td>
                      <td>
                        <strong className="admin-promotion-percent">
                          {item.discountPercent}%
                        </strong>
                      </td>
                      <td>{formatPromotionDate(item.startDate)}</td>
                      <td>{formatPromotionDate(item.endDate)}</td>
                      <td>
                        <span className="admin-promotion-type">
                          {item.applyType}. {promotionApplyTypeLabel(item.applyType)}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-promotion-status ${status}`}>
                          {promotionStatusLabel(item)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-room-row-actions">
                          <button
                            className="admin-icon-button"
                            type="button"
                            onClick={() => openEdit(item)}
                            title="Sửa khuyến mãi"
                            aria-label={`Sửa ${item.name}`}
                          >
                            ✎
                          </button>
                          <button
                            className="admin-icon-button danger"
                            type="button"
                            onClick={() => void handleDelete(item)}
                            title="Xóa khuyến mãi"
                            aria-label={`Xóa ${item.name}`}
                          >
                            ⌫
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-room-empty">
            <strong>Chưa có chương trình khuyến mãi</strong>
            <span>Bấm “+ Thêm khuyến mãi” để tạo chương trình mới.</span>
          </div>
        )}
      </section>

      <AdminFormModal
        open={showForm}
        eyebrow="KHUYẾN MÃI"
        title={editingId ? "Sửa chương trình ưu đãi" : "Thêm chương trình ưu đãi"}
        size="medium"
        onClose={() => setShowForm(false)}
      >
        <form className="admin-promotion-form" onSubmit={handleSubmit}>
          <label className="admin-promotion-full">
            <span>Tên chương trình *</span>
            <input
              required
              maxLength={255}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ví dụ: Giảm 20% cuối tuần"
            />
          </label>

          <label>
            <span>% giảm giá *</span>
            <div className="admin-promotion-percent-input">
              <input
                required
                type="number"
                min="1"
                max="100"
                step="1"
                value={form.discountPercent}
                onChange={(event) => setForm((current) => ({ ...current, discountPercent: event.target.value }))}
                placeholder="20"
              />
              <strong>%</strong>
            </div>
          </label>

          <label>
            <span>Hình thức áp dụng *</span>
            <select
              required
              value={form.applyType}
              onChange={(event) => setForm((current) => ({ ...current, applyType: event.target.value as "1" | "2" }))}
            >
              <option value="1">1 - Khách sạn</option>
              <option value="2">2 - Nhà hàng</option>
            </select>
          </label>

          <label>
            <span>Bắt đầu *</span>
            <input
              required
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
            />
          </label>

          <label>
            <span>Kết thúc *</span>
            <input
              required
              type="date"
              min={form.startDate || undefined}
              value={form.endDate}
              onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
            />
          </label>

          {error && (
            <div className="admin-room-form-notice error admin-promotion-full">⚠ {error}</div>
          )}

          <div className="admin-promotion-actions admin-promotion-full">
            <button className="admin-secondary-button" type="button" onClick={() => setShowForm(false)}>
              Hủy
            </button>
            <button className="admin-primary-button" type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "+ Thêm khuyến mãi"}
            </button>
          </div>
        </form>
      </AdminFormModal>
    </AdminRoomLayout>
  )
}
