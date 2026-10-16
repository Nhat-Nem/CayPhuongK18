import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { fileToRoomImage } from "@/utils/roomImage"
import {
  addMenuDish,
  deleteMenuDish,
  getMenuDishes,
  MENU_UPDATED_EVENT,
  updateMenuDish,
  type MenuDish,
} from "@/services/menuStore"

const EMPTY_FORM = {
  name: "",
  price: "",
  group: "Món ăn" as "Món ăn" | "Tráng miệng",
  category: "",
  description: "",
  image: "",
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuDish[]>(() => getMenuDishes())
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState("")
  const [processingImage, setProcessingImage] = useState(false)

  const refresh = () => setItems(getMenuDishes())

  useEffect(() => {
    window.addEventListener(MENU_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(MENU_UPDATED_EVENT, refresh)
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")
    return items.filter((item) =>
      !keyword ||
      [item.name, item.category, item.group]
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword),
    )
  }, [items, query])

  const closeModal = () => {
    setOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError("")
    setProcessingImage(false)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError("")
    setOpen(true)
  }

  const openEdit = (item: MenuDish) => {
    if (!item.custom) {
      setError("Món có sẵn trong source hiện chỉ đọc. Hãy thêm món mới để chỉnh sửa từ giao diện quản trị.")
      return
    }
    setEditingId(item.id)
    setForm({
      name: item.name,
      price: item.price.replace(/[^0-9]/g, ""),
      group: item.group,
      category: item.category,
      description: item.description ?? "",
      image: item.image,
    })
    setError("")
    setOpen(true)
  }

  const pickImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setProcessingImage(true)
    setError("")
    try {
      const image = await fileToRoomImage(file)
      setForm((current) => ({ ...current, image }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xử lý ảnh món ăn.")
      event.target.value = ""
    } finally {
      setProcessingImage(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const priceValue = Number(form.price.replace(/[^0-9]/g, ""))
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError("Giá món phải lớn hơn 0.")
      return
    }

    const payload = {
      image: form.image || "/assets/122ab.png",
      name: form.name.trim(),
      price: `${new Intl.NumberFormat("vi-VN").format(priceValue)} VNĐ`,
      group: form.group,
      category: form.category.trim() || form.group,
      description: form.description.trim(),
    }

    try {
      if (editingId) updateMenuDish(editingId, payload)
      else addMenuDish(payload)
      refresh()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu món ăn.")
    }
  }

  const remove = (item: MenuDish) => {
    if (!item.custom) {
      setError("Món có sẵn trong source hiện chỉ đọc và không bị xóa khỏi frontend.")
      return
    }
    if (!window.confirm(`Xóa món ${item.name}?`)) return
    try {
      deleteMenuDish(item.id)
      refresh()
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa món ăn.")
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="THỰC ĐƠN"
      title="Quản lý thực đơn"
      subtitle="Thêm và quản lý món ăn hiển thị trên website."
      primaryAction={
        <button className="admin-primary-button" type="button" onClick={openCreate}>
          ＋ Thêm món
        </button>
      }
    >
      {error && !open && <div className="admin-room-form-notice error">⚠ {error}</div>}

      <section className="admin-room-panel">
        <div className="admin-room-toolbar">
          <label className="admin-room-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên món, danh mục..."
            />
          </label>
          <span className="admin-room-result-count">{filtered.length} món</span>
        </div>

        <div className="admin-room-table-wrap">
          <table className="admin-room-table admin-menu-table">
            <thead>
              <tr>
                <th>Món ăn</th>
                <th>Nhóm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Nguồn</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-room-cell">
                      <img src={item.image} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.description || "Chưa có mô tả"}</span>
                      </div>
                    </div>
                  </td>
                  <td>{item.group}</td>
                  <td>{item.category}</td>
                  <td>{item.price}</td>
                  <td>{item.custom ? "Đã thêm" : "Có sẵn"}</td>
                  <td>
                    <div className="admin-room-row-actions">
                      <button className="admin-icon-button" type="button" onClick={() => openEdit(item)} title="Sửa món">✎</button>
                      <button className="admin-icon-button danger" type="button" onClick={() => remove(item)} title="Xóa món">⌫</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {open && (
        <div className="admin-room-modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section className="admin-room-modal admin-menu-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <p className="admin-room-eyebrow">{editingId ? "SỬA MÓN" : "THÊM MÓN"}</p>
            <h2>{editingId ? "Cập nhật món ăn" : "Thêm món mới"}</h2>
            <form className="admin-room-form admin-menu-form" onSubmit={submit}>
              <label><span>Tên món *</span><input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
              <label><span>Giá (VNĐ) *</span><input required min="1" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} /></label>
              <label><span>Nhóm *</span><select value={form.group} onChange={(event) => setForm((current) => ({ ...current, group: event.target.value as "Món ăn" | "Tráng miệng" }))}><option>Món ăn</option><option>Tráng miệng</option></select></label>
              <label><span>Danh mục *</span><input required value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Ví dụ: Món nướng" /></label>
              <label><span>Ảnh món</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void pickImage(event)} /><small>{processingImage ? "Đang xử lý ảnh..." : "JPG, PNG hoặc WEBP · tối đa 8 MB"}</small></label>
              {form.image && <img className="admin-menu-preview" src={form.image} alt="Xem trước món ăn" />}
              <label><span>Mô tả</span><textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
              {error && <div className="admin-room-form-notice error">⚠ {error}</div>}
              <div className="admin-room-modal-actions">
                <button className="admin-secondary-button" type="button" onClick={closeModal}>Hủy</button>
                <button className="admin-primary-button" type="submit" disabled={processingImage}>{processingImage ? "Đang xử lý..." : "Lưu món"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminRoomLayout>
  )
}
