import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminFormModal from "@/components/admin/AdminFormModal"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { getMenuDishes, type MenuDish } from "@/services/menuStore"
import {
  addOrderItem,
  createOrder,
  getOrderById,
  getOrders,
  removeOrderItem,
  updateOrder,
  updateOrderItemQuantity,
  type OrderItemRecord,
  type OrderRecord,
} from "@/services/orderApi"

const EMPTY_FORM = {
  note: "",
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function orderCode(id: string) {
  return `#${String(id).slice(-6)}`
}

function orderLabel(order: OrderRecord) {
  return order.code?.trim() || orderCode(order.id)
}

function orderStatusLabel(status: OrderRecord["status"]) {
  const labels: Record<OrderRecord["status"], string> = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  }
  return labels[status] ?? status
}

function paymentStatusLabel(status: OrderRecord["paymentStatus"]) {
  return status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"
}

function itemSummary(order: OrderRecord) {
  const items = order.items ?? []
  if (items.length === 0) return "Chưa có món"

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  )

  return `${items.length} món · ${totalQuantity} phần`
}

function itemName(item: OrderItemRecord) {
  return item.menuItem?.name || `Món #${item.menuItemId}`
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [menuItems, setMenuItems] = useState<MenuDish[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)

  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null)
  const [editingForm, setEditingForm] = useState(EMPTY_FORM)
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("")

  const refreshOrders = async () => {
    setLoading(true)
    try {
      setOrders(await getOrders())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đơn hàng.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshOrders()

    getMenuDishes()
      .then((rows) => {
        setMenuItems(rows)
        setSelectedMenuItemId(rows[0]?.id ?? "")
      })
      .catch((err: Error) => {
        setError(err.message || "Không thể tải thực đơn.")
      })
      .finally(() => setLoadingMenu(false))
  }, [])

  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")
    if (!keyword) return orders

    return orders.filter((order) =>
      [
        order.id,
        order.code,
        order.status,
        order.note,
        ...((order.items ?? []).map(itemName)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword),
    )
  }, [orders, query])

  const todayCount = useMemo(() => {
    const today = new Date()

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt)

      return (
        createdAt.getFullYear() === today.getFullYear() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getDate() === today.getDate()
      )
    }).length
  }, [orders])

  const totalValue = useMemo(
    () => orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0),
    [orders],
  )

  const openCreate = () => {
    setCreateForm(EMPTY_FORM)
    setError("")
    setCreateOpen(true)
  }

  const openEditor = async (order: OrderRecord) => {
    setError("")
    try {
      const fresh = await getOrderById(order.id)
      setEditingOrder(fresh)
      setEditingForm({
        note: fresh.note ?? "",
      })
      setSelectedMenuItemId((current) => current || menuItems[0]?.id || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng.")
    }
  }

  const syncEditor = async (order?: OrderRecord) => {
    if (order) setEditingOrder(order)
    await refreshOrders()
  }

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    try {
      const created = await createOrder({
        note: createForm.note.trim() || undefined,
      })
      setCreateOpen(false)
      setCreateForm(EMPTY_FORM)
      await refreshOrders()
      await openEditor(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.")
    } finally {
      setSaving(false)
    }
  }

  const saveOrderInfo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingOrder) return

    setSaving(true)
    setError("")
    try {
      const updated = await updateOrder(editingOrder.id, {
        note: editingForm.note.trim(),
      })
      await syncEditor(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật đơn hàng.")
    } finally {
      setSaving(false)
    }
  }

  const addDish = async () => {
    if (!editingOrder || !selectedMenuItemId) return

    setSaving(true)
    setError("")
    try {
      const updated = await addOrderItem(editingOrder.id, selectedMenuItemId, 1)
      await syncEditor(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm món vào đơn.")
    } finally {
      setSaving(false)
    }
  }

  const changeQuantity = async (item: OrderItemRecord, quantity: number) => {
    if (!editingOrder || quantity < 1) return

    setSaving(true)
    setError("")
    try {
      const updated = await updateOrderItemQuantity(
        editingOrder.id,
        item.id,
        quantity,
      )
      await syncEditor(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật số lượng.")
    } finally {
      setSaving(false)
    }
  }

  const removeDish = async (item: OrderItemRecord) => {
    if (!editingOrder) return

    if (!window.confirm(`Xóa “${itemName(item)}” khỏi đơn hàng?`)) return

    setSaving(true)
    setError("")
    try {
      const updated = await removeOrderItem(editingOrder.id, item.id)
      await syncEditor(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa món khỏi đơn.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="ĐƠN HÀNG"
      title="Quản lý đơn hàng"
      subtitle="Đơn hàng được đồng bộ trực tiếp với backend. Nhân viên và Admin có thể tạo, thêm món, chỉnh số lượng, xóa món và cập nhật ghi chú."
      primaryAction={
        <button
          className="admin-primary-button"
          type="button"
          onClick={openCreate}
        >
          ＋ Tạo đơn hàng
        </button>
      }
    >
      <section className="admin-room-stats admin-order-stats">
        <article>
          <span>TỔNG ĐƠN</span>
          <strong>{orders.length}</strong>
          <small>Trong database</small>
        </article>

        <article>
          <span>HÔM NAY</span>
          <strong>{todayCount}</strong>
          <small>Đơn được tạo hôm nay</small>
        </article>

        <article>
          <span>TỔNG GIÁ TRỊ</span>
          <strong className="admin-order-stat-money">
            {formatMoney(totalValue)}
          </strong>
          <small>Tính theo món đang có trong đơn</small>
        </article>
      </section>

      {error && (
        <div className="admin-room-form-notice error">⚠ {error}</div>
      )}

      <section className="admin-room-panel">
        <div className="admin-room-toolbar">
          <label className="admin-room-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã đơn, trạng thái, ghi chú, món..."
            />
          </label>

          <span className="admin-room-result-count">
            {filteredOrders.length} đơn
          </span>
        </div>

        {loading ? (
          <div className="admin-room-empty"><strong>Đang tải đơn hàng...</strong></div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-room-empty">
            <strong>Chưa có đơn hàng</strong>
            <span>Nhấn “Tạo đơn hàng” để bắt đầu.</span>
          </div>
        ) : (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-order-table">
              <thead>
                <tr>
                  <th>Đơn hàng</th>
                  <th>Trạng thái</th>
                  <th>Món</th>
                  <th>Ghi chú</th>
                  <th>Tổng tiền</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{orderLabel(order)}</strong>
                      <small className="admin-order-cell-subtext">
                        {formatDateTime(order.createdAt)}
                      </small>
                    </td>

                    <td>
                      <strong>{orderStatusLabel(order.status)}</strong>
                      <small className="admin-order-cell-subtext">
                        {paymentStatusLabel(order.paymentStatus)}
                      </small>
                    </td>

                    <td>{itemSummary(order)}</td>

                    <td>
                      <span className="admin-order-note-preview">
                        {order.note || "—"}
                      </span>
                    </td>

                    <td>
                      <strong className="admin-order-money">
                        {formatMoney(Number(order.totalAmount || 0))}
                      </strong>
                    </td>

                    <td>
                      <button
                        className="admin-icon-button"
                        type="button"
                        onClick={() => void openEditor(order)}
                        title="Mở và chỉnh sửa đơn hàng"
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminFormModal
        open={createOpen}
        eyebrow="TẠO ĐƠN"
        title="Tạo đơn hàng"
        onClose={() => setCreateOpen(false)}
      >
        <form className="admin-order-form" onSubmit={submitCreate}>
          <label className="admin-order-form-full">
            <span>Ghi chú đơn hàng</span>
            <textarea
              value={createForm.note}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, note: event.target.value }))
              }
              placeholder="Ví dụ: ít cay, không hành..."
            />
          </label>

          <div className="admin-order-form-actions admin-order-form-full">
            <button className="admin-secondary-button" type="button" onClick={() => setCreateOpen(false)}>
              Hủy
            </button>
            <button className="admin-primary-button" type="submit" disabled={saving}>
              {saving ? "Đang tạo..." : "Tạo đơn"}
            </button>
          </div>
        </form>
      </AdminFormModal>

      <AdminFormModal
        open={Boolean(editingOrder)}
        eyebrow="CHI TIẾT ĐƠN"
        title={editingOrder ? `Chỉnh sửa đơn ${orderLabel(editingOrder)}` : "Chỉnh sửa đơn"}
        onClose={() => setEditingOrder(null)}
        size="wide"
      >
        {editingOrder && (
          <div className="admin-order-editor">
            <form className="admin-order-form" onSubmit={saveOrderInfo}>
              <label className="admin-order-form-full">
                <span>Ghi chú</span>
                <textarea
                  value={editingForm.note}
                  onChange={(event) =>
                    setEditingForm((current) => ({ ...current, note: event.target.value }))
                  }
                  placeholder="Yêu cầu đặc biệt của khách..."
                />
              </label>

              <div className="admin-order-form-actions admin-order-form-full">
                <button className="admin-primary-button" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu thông tin đơn"}
                </button>
              </div>
            </form>

            <div className="admin-order-divider" />

            <section className="admin-order-items-section">
              {editingOrder.status !== "PENDING" && (
                <div className="admin-room-form-notice">
                  Đơn đang ở trạng thái {orderStatusLabel(editingOrder.status)}. Theo quy tắc backend, chỉ đơn “Chờ xử lý” mới được thêm, sửa hoặc xóa món.
                </div>
              )}

              <div className="admin-order-items-heading">
                <div>
                  <span>MÓN TRONG ĐƠN</span>
                  <h3>Thêm và điều chỉnh món ăn</h3>
                </div>
                <strong>{formatMoney(Number(editingOrder.totalAmount || 0))}</strong>
              </div>

              <div className="admin-order-add-item">
                <select
                  value={selectedMenuItemId}
                  onChange={(event) => setSelectedMenuItemId(event.target.value)}
                  disabled={
                    loadingMenu ||
                    menuItems.length === 0 ||
                    saving ||
                    editingOrder.status !== "PENDING"
                  }
                >
                  {menuItems.length === 0 ? (
                    <option value="">{loadingMenu ? "Đang tải thực đơn..." : "Không có món"}</option>
                  ) : (
                    menuItems.map((dish) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name} · {dish.price}
                      </option>
                    ))
                  )}
                </select>

                <button
                  className="admin-primary-button"
                  type="button"
                  onClick={() => void addDish()}
                  disabled={
                    !selectedMenuItemId ||
                    saving ||
                    editingOrder.status !== "PENDING"
                  }
                >
                  ＋ Thêm món
                </button>
              </div>

              {(editingOrder.items ?? []).length === 0 ? (
                <div className="admin-order-empty-items">
                  Chưa có món trong đơn. Chọn món phía trên để thêm.
                </div>
              ) : (
                <div className="admin-order-item-list">
                  {(editingOrder.items ?? []).map((item) => (
                    <article className="admin-order-item-row" key={item.id}>
                      <div className="admin-order-item-info">
                        {item.menuItem?.image ? (
                          <img src={item.menuItem.image} alt="" />
                        ) : (
                          <div className="admin-order-item-placeholder">MÓN</div>
                        )}

                        <div>
                          <strong>{itemName(item)}</strong>
                          <small>{formatMoney(Number(item.unitPrice))} / phần</small>
                        </div>
                      </div>

                      <div className="admin-order-quantity" aria-label={`Số lượng ${itemName(item)}`}>
                        <button
                          type="button"
                          onClick={() => void changeQuantity(item, item.quantity - 1)}
                          disabled={
                            item.quantity <= 1 ||
                            saving ||
                            editingOrder.status !== "PENDING"
                          }
                          title="Giảm số lượng"
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => void changeQuantity(item, item.quantity + 1)}
                          disabled={saving || editingOrder.status !== "PENDING"}
                          title="Tăng số lượng"
                        >＋</button>
                      </div>

                      <strong className="admin-order-item-subtotal">
                        {formatMoney(Number(item.unitPrice) * Number(item.quantity))}
                      </strong>

                      <button
                        className="admin-order-remove-item"
                        type="button"
                        onClick={() => void removeDish(item)}
                        disabled={saving || editingOrder.status !== "PENDING"}
                        title="Xóa món khỏi đơn"
                      >×</button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </AdminFormModal>
    </AdminRoomLayout>
  )
}
