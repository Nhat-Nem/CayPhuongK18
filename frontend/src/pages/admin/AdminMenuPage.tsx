import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  addMenuDish,
  createMenuCategory,
  deleteMenuCategory,
  deleteMenuDish,
  getMenuCategories,
  getMenuDishes,
  updateMenuCategory,
  updateMenuDish,
  type MenuCategory,
  type MenuDish,
} from "@/services/menuStore"
import { fileToMenuImage } from "@/utils/menuImage"


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
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")
  const [categorySaving, setCategorySaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [categoryEditName, setCategoryEditName] = useState("")
  const [categoryEditDescription, setCategoryEditDescription] = useState("")
  const [categoryEditError, setCategoryEditError] = useState("")
  const [categoryEditSaving, setCategoryEditSaving] = useState(false)
  const [processingImage, setProcessingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

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

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name] as const)),
    [categories],
  )

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")

    return items.filter((item) => {
      const categoryName = categoryNameById.get(item.categoryId) ?? item.category
      return (
        !keyword ||
        [item.name, categoryName, item.description]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(keyword)
      )
    })
  }, [items, query, categoryNameById])

  const closeModal = () => {
    setOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError("")
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" })
    setError("")
    setOpen(true)
  }

  const openEdit = (item: MenuDish) => {
    setEditingId(item.id)
    setForm({
      name: item.name,
      price: String(item.priceValue),
      categoryId:
        item.categoryId ||
        categories.find((category) => category.name === item.category)?.id ||
        "",
      description: item.description,
      ingredient: item.ingredient,
      image: item.image === "/assets/122ab.png" ? "" : item.image,
    })
    setError("")
    setOpen(true)
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setProcessingImage(true)
    setError("")

    try {
      const image = await fileToMenuImage(file)
      setForm((current) => ({ ...current, image }))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý ảnh món ăn.",
      )
    } finally {
      setProcessingImage(false)
      event.target.value = ""
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

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

  const openEditCategory = (category: MenuCategory) => {
    setEditingCategory(category)
    setCategoryEditName(category.name)
    setCategoryEditDescription(category.description)
    setCategoryEditError("")
  }

  const closeEditCategory = () => {
    if (categoryEditSaving) return
    setEditingCategory(null)
    setCategoryEditName("")
    setCategoryEditDescription("")
    setCategoryEditError("")
  }

  const saveCategoryEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingCategory) return

    const nextName = categoryEditName.trim()
    if (!nextName) {
      setCategoryEditError("Vui lòng nhập tên danh mục.")
      return
    }

    setCategoryEditSaving(true)
    setCategoryEditError("")

    try {
      await updateMenuCategory(editingCategory.id, {
        name: nextName,
        description: categoryEditDescription,
      })
      setEditingCategory(null)
      setCategoryEditName("")
      setCategoryEditDescription("")
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật danh mục."
      const routeNotAvailable =
        /\b404\b|\b405\b|cannot\s+(?:patch|put)|not found/i.test(message)

      setCategoryEditError(
        routeNotAvailable
          ? "Backend hiện chưa có API PATCH /api/v1/category/:id. Giao diện đã sẵn sàng; cần backend bổ sung API này để lưu thay đổi."
          : message,
      )
    } finally {
      setCategoryEditSaving(false)
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
            <div className="admin-menu-category-card" key={category.id}>
              <div className="admin-menu-category-content">
                <strong>{category.name}</strong>
                <small>{category.description || "Không có mô tả"}</small>
              </div>
              <div className="admin-menu-category-actions">
                <button
                  className="admin-menu-category-edit"
                  type="button"
                  onClick={() => openEditCategory(category)}
                  title={`Sửa danh mục ${category.name}`}
                  aria-label={`Sửa danh mục ${category.name}`}
                >
                  ✎
                </button>
                <button
                  className="admin-menu-category-delete"
                  type="button"
                  onClick={() => void removeCategory(category)}
                  title={`Xóa danh mục ${category.name}`}
                  aria-label={`Xóa danh mục ${category.name}`}
                >
                  ×
                </button>
              </div>
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
                    <td>{categoryNameById.get(item.categoryId) ?? item.category}</td>
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

              <div className="admin-menu-image-upload-field">
                <span className="admin-menu-image-upload-label">Ảnh món</span>
                <input
                  ref={imageInputRef}
                  className="admin-menu-hidden-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={processingImage || saving}
                  onChange={(event) => void handleImageChange(event)}
                  aria-label="Chọn ảnh món ăn từ máy tính"
                />
                <button
                  className="admin-primary-button admin-menu-upload-button"
                  type="button"
                  disabled={processingImage || saving}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {processingImage ? "Đang xử lý ảnh..." : "＋ Thêm ảnh"}
                </button>
                <small>
                  Chọn ảnh JPG, PNG hoặc WEBP từ máy · tối đa 8 MB.
                  {form.image ? " Ảnh đã sẵn sàng để lưu cùng món ăn." : " Chưa chọn ảnh."}
                </small>
              </div>

              {form.image && (
                <>
                  <img
                    className="admin-menu-preview"
                    src={form.image}
                    alt="Xem trước món ăn"
                  />
                  <button
                    className="admin-secondary-button"
                    type="button"
                    onClick={() =>
                      setForm((current) => ({ ...current, image: "" }))
                    }
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
                <button className="admin-primary-button" type="submit" disabled={saving || processingImage}>
                  {saving ? "Đang lưu..." : processingImage ? "Đang xử lý ảnh..." : "Lưu món"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingCategory && (
        <div
          className="admin-room-modal-backdrop"
          role="presentation"
          onMouseDown={closeEditCategory}
        >
          <section
            className="admin-room-modal admin-menu-modal admin-menu-category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-menu-category-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="admin-room-eyebrow">DANH MỤC MÓN ĂN</p>
            <h2 id="admin-menu-category-modal-title">Chỉnh sửa danh mục</h2>

            <form className="admin-room-form admin-menu-form" onSubmit={saveCategoryEdit}>
              <label>
                <span>Tên danh mục *</span>
                <input
                  autoFocus
                  required
                  maxLength={120}
                  value={categoryEditName}
                  onChange={(event) => setCategoryEditName(event.target.value)}
                  placeholder="Nhập tên danh mục"
                />
              </label>

              <label>
                <span>Mô tả</span>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={categoryEditDescription}
                  onChange={(event) => setCategoryEditDescription(event.target.value)}
                  placeholder="Mô tả ngắn cho danh mục (không bắt buộc)"
                />
              </label>

              {categoryEditError && (
                <div className="admin-room-form-notice error" role="alert">
                  ⚠ {categoryEditError}
                </div>
              )}

              <div className="admin-room-modal-actions">
                <button
                  className="admin-secondary-button"
                  type="button"
                  onClick={closeEditCategory}
                  disabled={categoryEditSaving}
                >
                  Hủy
                </button>
                <button
                  className="admin-primary-button"
                  type="submit"
                  disabled={categoryEditSaving}
                >
                  {categoryEditSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AdminRoomLayout>
  )
}
