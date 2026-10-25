import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  addMenuDish,
  createMenuCategory,
  deleteMenuCategory,
  deleteMenuDish,
  getMenuCategories,
  getMenuDishes,
  updateMenuDish,
  type MenuCategory,
  type MenuDish,
} from "@/services/menuStore"


function compareNewestIdFirst(
  a: { id: string | number },
  b: { id: string | number },
) {
  return String(b.id).localeCompare(String(a.id), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

const EMPTY_FORM = {
  name: "",
  price: "",
  categoryId: "",
  description: "",
  ingredient: "",
  image: "",
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuDish[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [localImagePreview, setLocalImagePreview] = useState("")
  const [localImageName, setLocalImageName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [categorySaving, setCategorySaving] = useState(false)

  const refresh = async () => {
    setLoading(true)
    setError("")

    try {
      const [menuRows, categoryRows] = await Promise.all([
        getMenuDishes(),
        getMenuCategories(),
      ])
      setItems(menuRows)
      setCategories([...categoryRows].sort(compareNewestIdFirst))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thực đơn.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")

    return items.filter(
      (item) =>
        !keyword ||
        [item.name, item.category, item.description]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(keyword),
    )
  }, [items, query])

  const clearLocalImagePreview = () => {
    setLocalImagePreview((current) => {
      if (current) URL.revokeObjectURL(current)
      return ""
    })
    setLocalImageName("")
  }

  const closeModal = () => {
    clearLocalImagePreview()
    setOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError("")
  }

  const openCreate = () => {
    clearLocalImagePreview()
    setEditingId(null)
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" })
    setError("")
    setOpen(true)
  }

  const openEdit = (item: MenuDish) => {
    clearLocalImagePreview()
    setEditingId(item.id)
    setForm({
      name: item.name,
      price: String(item.priceValue),
      categoryId: item.categoryId,
      description: item.description,
      ingredient: item.ingredient,
      image: item.image === "/assets/122ab.png" ? "" : item.image,
    })
    setError("")
    setOpen(true)
  }


  const handleLocalImageSelect = (file?: File) => {
    clearLocalImagePreview()
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn một tệp hình ảnh hợp lệ.")
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setLocalImagePreview(previewUrl)
    setLocalImageName(file.name)
    setError("")
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (localImagePreview) {
      setError(
        `Ảnh “${localImageName}” mới chỉ được xem trước trên trình duyệt. Hãy sao chép tệp vào frontend/public/assets, sau đó nhập đường dẫn /assets/${localImageName} bên dưới rồi mới lưu. Website không tự tải tệp lên khi chưa có nơi lưu ảnh.`,
      )
      return
    }

    const priceValue = Number(form.price)
    const categoryId = Number(form.categoryId)

    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError("Giá món phải là số lớn hơn hoặc bằng 0.")
      return
    }

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      setError("Vui lòng chọn danh mục món ăn.")
      return
    }

    if (/^data:image\//i.test(form.image.trim())) {
      setError(
        "Không thể lưu ảnh tải lên trực tiếp vì cột image của database không chứa được dữ liệu Base64. Hãy dùng đường dẫn ảnh có sẵn như /assets/f975d.png hoặc URL ảnh HTTPS.",
      )
      return
    }

    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        price: priceValue,
        categoryId,
        description: form.description.trim(),
        ingredient: form.ingredient.trim(),
        image: form.image.trim(),
      }

      if (editingId) {
        await updateMenuDish(editingId, payload)
      } else {
        await addMenuDish(payload)
      }

      closeModal()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu món ăn.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item: MenuDish) => {
    if (!window.confirm(`Xóa món ${item.name}?`)) return

    try {
      await deleteMenuDish(item.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa món ăn.")
    }
  }

  const addCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!categoryName.trim()) return

    setCategorySaving(true)
    setError("")

    try {
      await createMenuCategory({
        name: categoryName,
        description: categoryDescription,
      })
      setCategoryName("")
      setCategoryDescription("")
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm danh mục.")
    } finally {
      setCategorySaving(false)
    }
  }

  const removeCategory = async (category: MenuCategory) => {
    if (items.some((item) => item.categoryId === category.id)) {
      setError(`Danh mục “${category.name}” đang được món ăn sử dụng nên không thể xóa.`)
      return
    }

    if (!window.confirm(`Xóa danh mục ${category.name}?`)) return

    try {
      await deleteMenuCategory(category.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa danh mục.")
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="THỰC ĐƠN"
      title="Quản lý thực đơn"
      subtitle="Món ăn lấy từ /api/v1/menu-items và danh mục lấy từ /api/v1/category."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={openCreate}
          disabled={categories.length === 0}
        >
          ＋ Thêm món
        </button>
      }
    >
      {error && !open && (
        <div className="admin-room-form-notice error">⚠ {error}</div>
      )}

      <section className="admin-menu-category-panel">
        <div className="admin-s2-section-heading">
          <div>
            <span>DANH MỤC MÓN ĂN</span>
            <h2>Quản lý danh mục</h2>
          </div>
        </div>

        <form className="admin-menu-category-form" onSubmit={addCategory}>
          <input
            required
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Tên danh mục"
          />
          <input
            value={categoryDescription}
            onChange={(event) => setCategoryDescription(event.target.value)}
            placeholder="Mô tả (không bắt buộc)"
          />
          <button
            className="admin-primary-button"
            type="submit"
            disabled={categorySaving}
          >
            {categorySaving ? "Đang thêm..." : "+ Thêm danh mục"}
          </button>
        </form>

        <div className="admin-menu-category-list">
          {categories.map((category) => (
            <div key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <small>{category.description || "Không có mô tả"}</small>
              </div>
              <button
                type="button"
                onClick={() => void removeCategory(category)}
                title="Xóa danh mục"
              >
                ×
              </button>
            </div>
          ))}

          {!loading && categories.length === 0 && (
            <p>Chưa có danh mục. Hãy tạo danh mục trước khi thêm món.</p>
          )}
        </div>
      </section>

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

        {loading ? (
          <div className="admin-room-empty">
            <strong>Đang tải thực đơn...</strong>
          </div>
        ) : (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-menu-table">
              <thead>
                <tr>
                  <th>Món ăn</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Nguyên liệu</th>
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
                    <td>{item.category}</td>
                    <td>{item.price}</td>
                    <td>{item.ingredient || "—"}</td>
                    <td>
                      <div className="admin-room-row-actions">
                        <button
                          className="admin-icon-button"
                          type="button"
                          onClick={() => openEdit(item)}
                          title="Sửa món"
                        >
                          ✎
                        </button>
                        <button
                          className="admin-icon-button danger"
                          type="button"
                          onClick={() => void remove(item)}
                          title="Xóa món"
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
      </section>

      {open && (
        <div className="admin-room-modal-backdrop" role="presentation" onMouseDown={closeModal}>
          <section
            className="admin-room-modal admin-menu-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="admin-room-eyebrow">{editingId ? "SỬA MÓN" : "THÊM MÓN"}</p>
            <h2>{editingId ? "Cập nhật món ăn" : "Thêm món mới"}</h2>

            <form className="admin-room-form admin-menu-form" onSubmit={submit}>
              <label>
                <span>Tên món *</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>

              <label>
                <span>Giá (VNĐ) *</span>
                <input
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                />
              </label>

              <label>
                <span>Danh mục *</span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, categoryId: event.target.value }))
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Chọn ảnh từ máy tính (xem trước)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  onChange={(event) => handleLocalImageSelect(event.target.files?.[0])}
                />
                <small>
                  Không cần Cloudinary. Tệp được chọn chỉ xem trước trên máy này; để ảnh lưu được và mọi người cùng thấy, hãy chép ảnh vào frontend/public/assets rồi nhập đường dẫn ở ô bên dưới và đẩy thay đổi lên GitHub để triển khai lại.
                </small>
              </label>

              <label>
                <span>Đường dẫn ảnh đã có trong dự án</span>
                <input
                  type="text"
                  value={form.image}
                  onChange={(event) => {
                    clearLocalImagePreview()
                    setForm((current) => ({ ...current, image: event.target.value }))
                  }}
                  placeholder="/assets/ten-anh.png hoặc https://..."
                />
                <small>
                  Ví dụ: /assets/f975d.png. Không nhập dữ liệu Base64 (data:image/...).
                </small>
              </label>

              {(localImagePreview || form.image) && (
                <>
                  <img
                    className="admin-menu-preview"
                    src={localImagePreview || form.image}
                    alt="Xem trước món ăn"
                    onError={(event) => {
                      event.currentTarget.style.display = "none"
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = "block"
                    }}
                  />
                  {localImagePreview && (
                    <small>Đang xem trước tệp mới: {localImageName}</small>
                  )}
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={() => {
                      clearLocalImagePreview()
                      setForm((current) => ({ ...current, image: "" }))
                    }}
                  >
                    Xóa ảnh đã chọn
                  </button>
                </>
              )}

              <label>
                <span>Nguyên liệu</span>
                <input
                  value={form.ingredient}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, ingredient: event.target.value }))
                  }
                  placeholder="Ví dụ: Cá lóc, muối ớt..."
                />
              </label>

              <label>
                <span>Mô tả</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>

              {error && (
                <div className="admin-room-form-notice error">⚠ {error}</div>
              )}

              <div className="admin-room-modal-actions">
                <button className="admin-secondary-button" type="button" onClick={closeModal}>
                  Hủy
                </button>
                <button className="admin-primary-button" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu món"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminRoomLayout>
  )
}
