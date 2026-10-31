import { useEffect, useMemo, useState, type FormEvent } from "react"
import AdminFormModal from "@/components/admin/AdminFormModal"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { getMenuDishes, type MenuDish } from "@/services/menuStore"
import { getStaffDirectory, type StaffDirectoryUser } from "@/services/userApi"
import {
  addOrderItem,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  removeOrderItem,
  updateOrder,
  updateOrderItemQuantity,
  updateOrderStatus,
  recordOrderPayment,
  type OrderItemRecord,
  type OrderPaymentMethod,
  type OrderRecord,
  type OrderStatus,
} from "@/services/orderApi"

const EMPTY_FORM = {
  note: "",
}

type DraftOrderItem = {
  menuItemId: string
  quantity: number
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

function paymentMethodLabel(method: OrderPaymentMethod | null) {
  if (method === "CASH") return "Tiền mặt"
  if (method === "BANK_TRANSFER") return "Chuyển khoản"
  if (method === "CARD") return "Thẻ"
  return ""
}

function nextOrderStatuses(order: OrderRecord): Array<{ value: OrderStatus; label: string }> {
  // Đơn chỉ được chuyển sang Hoàn thành sau khi backend đã ghi nhận thanh toán.
  const canComplete = order.paymentStatus === "PAID"
  const canCancel = order.paymentStatus !== "PAID"
  const completionOption = canComplete
    ? [{ value: "COMPLETED" as const, label: "Hoàn thành" }]
    : []
  const cancellationOption = canCancel
    ? [{ value: "CANCELLED" as const, label: "Đã hủy" }]
    : []

  if (order.status === "PENDING") {
    return [
      { value: "CONFIRMED", label: "Đã xác nhận" },
      ...completionOption,
      ...cancellationOption,
    ]
  }

  if (order.status === "CONFIRMED") {
    return [...completionOption, ...cancellationOption]
  }

  return []
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

function localDateKey(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function orderEmployeeLabel(
  order: OrderRecord,
  employeesById: Map<string, StaffDirectoryUser>,
) {
  if (!order.createdBy) return "Chưa ghi nhận"

  const employee = employeesById.get(String(order.createdBy))
  return employee?.full_name?.trim() || employee?.username || `Nhân viên #${order.createdBy}`
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [menuItems, setMenuItems] = useState<MenuDish[]>([])
  const [query, setQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [staffUsers, setStaffUsers] = useState<StaffDirectoryUser[]>([])
  const [staffDirectoryError, setStaffDirectoryError] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(EMPTY_FORM)
  const [createItems, setCreateItems] = useState<DraftOrderItem[]>([])
  const [selectedCreateMenuItemId, setSelectedCreateMenuItemId] = useState("")

  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null)
  const [editingForm, setEditingForm] = useState(EMPTY_FORM)
  const [selectedMenuItemId, setSelectedMenuItemId] = useState("")
  const [paymentOrder, setPaymentOrder] = useState<OrderRecord | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>("CASH")
  const [paymentError, setPaymentError] = useState("")

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

    getStaffDirectory()
      .then(setStaffUsers)
      .catch((err: Error) => {
        // Danh sách đơn vẫn dùng được nếu endpoint người dùng tạm thời không khả dụng.
        setStaffDirectoryError(err.message || "Không thể tải danh sách nhân viên.")
      })

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

  const employeesById = useMemo(
    () => new Map(staffUsers.map((user) => [String(user.id), user] as const)),
    [staffUsers],
  )

  const employeeOptions = useMemo(() => {
    const options = new Map<string, string>()

    for (const user of staffUsers) {
      if (String(user.role ?? "").toUpperCase() !== "STAFF") continue
      const id = String(user.id)
      const name = user.full_name?.trim() || user.username?.trim() || `Nhân viên #${id}`
      options.set(id, name)
    }

    // Vẫn cho phép lọc các đơn cũ có createdBy nhưng nhân viên đã bị xóa/ẩn.
    for (const order of orders) {
      if (order.createdBy && !options.has(String(order.createdBy))) {
        options.set(String(order.createdBy), `Nhân viên #${order.createdBy}`)
      }
    }

    return [...options.entries()].sort((a, b) => a[1].localeCompare(b[1], "vi"))
  }, [orders, staffUsers])

  const invalidDateRange = Boolean(startDate && endDate && startDate > endDate)

  const filteredOrders = useMemo(() => {
    if (invalidDateRange) return []

    const keyword = query.trim().toLocaleLowerCase("vi")

    return orders.filter((order) => {
      const date = new Date(order.createdAt)
      if (Number.isNaN(date.getTime())) return false

      const dateKey = localDateKey(order.createdAt)
      if (startDate && dateKey < startDate) return false
      if (endDate && dateKey > endDate) return false
      if (selectedMonth && String(date.getMonth() + 1) !== selectedMonth) return false
      if (selectedYear && String(date.getFullYear()) !== selectedYear) return false

      if (selectedEmployee === "UNASSIGNED" && order.createdBy) return false
      if (selectedEmployee && selectedEmployee !== "UNASSIGNED" && String(order.createdBy ?? "") !== selectedEmployee) {
        return false
      }

      if (!keyword) return true

      return [
        order.id,
        order.code,
        order.status,
        order.note,
        orderEmployeeLabel(order, employeesById),
        ...((order.items ?? []).map(itemName)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword)
    })
  }, [
    orders,
    query,
    startDate,
    endDate,
    selectedMonth,
    selectedYear,
    selectedEmployee,
    employeesById,
    invalidDateRange,
  ])

  const availableYears = useMemo(() => {
    const years = new Set(orders.map((order) => {
      const date = new Date(order.createdAt)
      return Number.isNaN(date.getTime()) ? "" : String(date.getFullYear())
    }).filter(Boolean))
    years.add(String(new Date().getFullYear()))
    return [...years].sort((a, b) => Number(b) - Number(a))
  }, [orders])

  const clearOrderFilters = () => {
    setQuery("")
    setStartDate("")
    setEndDate("")
    setSelectedMonth("")
    setSelectedYear("")
    setSelectedEmployee("")
  }

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

  const createItemsTotal = useMemo(() => createItems.reduce((total, draft) => {
    const dish = menuItems.find((item) => item.id === draft.menuItemId)
    return total + Number(dish?.priceValue ?? 0) * draft.quantity
  }, 0), [createItems, menuItems])

  const openCreate = () => {
    setCreateForm(EMPTY_FORM)
    setCreateItems([])
    setSelectedCreateMenuItemId(menuItems[0]?.id ?? "")
    setError("")
    setCreateOpen(true)
  }

  const addCreateDish = () => {
    if (!selectedCreateMenuItemId) return
    setCreateItems((current) => {
      const existing = current.find((item) => item.menuItemId === selectedCreateMenuItemId)
      if (existing) {
        return current.map((item) => item.menuItemId === selectedCreateMenuItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item)
      }
      return [...current, { menuItemId: selectedCreateMenuItemId, quantity: 1 }]
    })
  }

  const changeCreateDishQuantity = (menuItemId: string, quantity: number) => {
    if (quantity < 1) {
      setCreateItems((current) => current.filter((item) => item.menuItemId !== menuItemId))
      return
    }
    setCreateItems((current) => current.map((item) => item.menuItemId === menuItemId
      ? { ...item, quantity }
      : item))
  }

  const openEditor = async (order: OrderRecord) => {
    setError("")
    if (order.status === "COMPLETED") {
      setError("Đơn hàng đã hoàn thành nên không thể chỉnh sửa.")
      return
    }

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

      let itemAddError = ""
      for (const draft of createItems) {
        try {
          await addOrderItem(created.id, draft.menuItemId, draft.quantity)
        } catch (err) {
          itemAddError = err instanceof Error ? err.message : "Không thể thêm một số món vào đơn."
          break
        }
      }

      setCreateOpen(false)
      setCreateForm(EMPTY_FORM)
      setCreateItems([])
      await refreshOrders()
      await openEditor(created)
      if (itemAddError) {
        setError(`Đơn đã được tạo nhưng một số món chưa thêm được: ${itemAddError}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.")
    } finally {
      setSaving(false)
    }
  }

  const removeOrder = async (order: OrderRecord) => {
    if (order.status !== "PENDING") {
      setError("Chỉ có thể xóa đơn đang ở trạng thái Chờ xử lý.")
      return
    }

    if (!window.confirm(`Bạn có chắc muốn xóa đơn ${orderLabel(order)}? Toàn bộ món trong đơn cũng sẽ bị xóa.`)) return

    setSaving(true)
    setError("")
    try {
      await deleteOrder(order.id)
      if (editingOrder?.id === order.id) setEditingOrder(null)
      await refreshOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa đơn hàng.")
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

  const changeOrderStatus = async (order: OrderRecord, status: OrderStatus) => {
    if (status === "COMPLETED" && order.paymentStatus !== "PAID") {
      setError("Không thể hoàn thành đơn hàng khi chưa ghi nhận thanh toán.")
      return
    }

    if (!nextOrderStatuses(order).some((option) => option.value === status)) return

    setSaving(true)
    setError("")
    try {
      const updated = await updateOrderStatus(order.id, status)
      setOrders((current) => current.map((item) =>
        item.id === order.id ? { ...item, ...updated, items: updated.items ?? item.items } : item,
      ))
      setEditingOrder((current) => current?.id === order.id
        ? (status === "COMPLETED" ? null : { ...current, ...updated, items: updated.items ?? current.items })
        : current,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái đơn hàng.")
    } finally {
      setSaving(false)
    }
  }

  const openPayment = (order: OrderRecord) => {
    setPaymentOrder(order)
    setPaymentMethod("CASH")
    setPaymentError("")
  }

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!paymentOrder) return

    setSaving(true)
    setPaymentError("")
    try {
      const updated = await recordOrderPayment(paymentOrder.id, paymentMethod)
      setOrders((current) => current.map((item) =>
        item.id === paymentOrder.id ? { ...item, ...updated, items: updated.items ?? item.items } : item,
      ))
      setEditingOrder((current) => current?.id === paymentOrder.id
        ? { ...current, ...updated, items: updated.items ?? current.items }
        : current,
      )
      setPaymentOrder(null)
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Không thể ghi nhận thanh toán.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="ĐƠN HÀNG"
      title="Quản lý đơn hàng"
      subtitle="Theo dõi đơn hàng, cập nhật trạng thái và ghi nhận thanh toán. Nhân viên có thể tạo đơn, thêm món, chỉnh số lượng và ghi chú."
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
              placeholder="Tìm mã đơn, trạng thái, ghi chú, món, nhân viên..."
            />
          </label>

          <span className="admin-room-result-count">
            {filteredOrders.length}/{orders.length} đơn
          </span>
        </div>

        <div className="admin-order-filters" aria-label="Bộ lọc đơn hàng">
          <label>
            <span>TỪ NGÀY</span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              aria-label="Lọc đơn từ ngày"
            />
          </label>

          <label>
            <span>ĐẾN NGÀY</span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              aria-label="Lọc đơn đến ngày"
            />
          </label>

          <label>
            <span>THÁNG</span>
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
              <option value="">Tất cả tháng</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={String(month)}>
                  Tháng {String(month).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>NĂM</span>
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
              <option value="">Tất cả năm</option>
              {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>

          <label>
            <span>NHÂN VIÊN PHỤ TRÁCH</span>
            <select value={selectedEmployee} onChange={(event) => setSelectedEmployee(event.target.value)}>
              <option value="">Tất cả nhân viên</option>
              {employeeOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              {orders.some((order) => !order.createdBy) && (
                <option value="UNASSIGNED">Chưa ghi nhận nhân viên</option>
              )}
            </select>
          </label>

          <button className="admin-secondary-button admin-order-clear-filters" type="button" onClick={clearOrderFilters}>
            Xóa bộ lọc
          </button>
        </div>

        {invalidDateRange && (
          <p className="admin-order-filter-error">Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.</p>
        )}
        {staffDirectoryError && (
          <p className="admin-order-filter-hint">Không tải được danh sách nhân viên: {staffDirectoryError}</p>
        )}
        {!loading && orders.length > 0 && orders.every((order) => !order.createdBy) && (
          <p className="admin-order-filter-hint">
            Backend hiện chưa ghi nhận nhân viên tạo đơn (createdBy đang trống). Các đơn này được hiển thị là “Chưa ghi nhận”; lọc theo tên nhân viên chỉ hoạt động với đơn có createdBy.
          </p>
        )}

        {loading ? (
          <div className="admin-room-empty"><strong>Đang tải đơn hàng...</strong></div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-room-empty">
            <strong>{orders.length > 0 ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng"}</strong>
            <span>{orders.length > 0 ? "Hãy thử thay đổi ngày, tháng, năm, nhân viên hoặc từ khóa tìm kiếm." : "Nhấn “Tạo đơn hàng” để bắt đầu."}</span>
          </div>
        ) : (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-order-table">
              <thead>
                <tr>
                  <th>Đơn hàng</th>
                  <th>Trạng thái</th>
                  <th>Nhân viên phụ trách</th>
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
                        {order.paymentMethod ? ` · ${paymentMethodLabel(order.paymentMethod)}` : ""}
                      </small>
                      {order.paidAt && (
                        <small className="admin-order-cell-subtext">
                          Thanh toán lúc {formatDateTime(order.paidAt)}
                        </small>
                      )}
                      {nextOrderStatuses(order).length > 0 && (
                        <select
                          className="admin-order-status-select"
                          aria-label={`Cập nhật trạng thái ${orderLabel(order)}`}
                          value=""
                          disabled={saving}
                          onChange={(event) => {
                            const nextStatus = event.target.value as OrderStatus
                            if (nextStatus) void changeOrderStatus(order, nextStatus)
                          }}
                        >
                          <option value="" disabled>Đổi trạng thái...</option>
                          {nextOrderStatuses(order).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td>
                      <strong>{orderEmployeeLabel(order, employeesById)}</strong>
                      {!order.createdBy && (
                        <small className="admin-order-cell-subtext">Backend chưa ghi nhận người tạo đơn</small>
                      )}
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
                      <div className="admin-room-row-actions admin-order-row-actions">
                        {order.paymentStatus !== "PAID" &&
                          order.status === "CONFIRMED" &&
                          Number(order.totalAmount || 0) > 0 && (
                            <button
                              className="admin-secondary-button admin-order-payment-button"
                              type="button"
                              disabled={saving}
                              onClick={() => openPayment(order)}
                            >
                              Thanh toán
                            </button>
                          )}
                        {order.status !== "COMPLETED" && (
                          <button
                            className="admin-icon-button"
                            type="button"
                            onClick={() => void openEditor(order)}
                            title="Mở và chỉnh sửa đơn hàng"
                          >
                            ✎
                          </button>
                        )}
                        <button
                          className="admin-icon-button danger"
                          type="button"
                          onClick={() => void removeOrder(order)}
                          disabled={saving || order.status !== "PENDING"}
                          title={order.status === "PENDING" ? "Xóa đơn hàng" : "Chỉ xóa được đơn đang chờ xử lý"}
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

      <AdminFormModal
        open={createOpen}
        eyebrow="TẠO ĐƠN"
        title="Tạo đơn hàng mới"
        onClose={() => { if (!saving) setCreateOpen(false) }}
        size="wide"
      >
        <form className="admin-order-editor" onSubmit={submitCreate}>
          <div className="admin-order-form">
            <label className="admin-order-form-full">
              <span>Ghi chú</span>
              <textarea
                value={createForm.note}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, note: event.target.value }))
                }
                placeholder="Yêu cầu đặc biệt của khách..."
              />
            </label>
          </div>

          <div className="admin-order-divider" />

          <section className="admin-order-items-section">
            <div className="admin-order-items-heading">
              <div>
                <span>MÓN TRONG ĐƠN</span>
                <h3>Thêm và điều chỉnh món ăn</h3>
              </div>
              <strong>{formatMoney(createItemsTotal)}</strong>
            </div>

            <div className="admin-order-add-item">
              <select
                value={selectedCreateMenuItemId}
                onChange={(event) => setSelectedCreateMenuItemId(event.target.value)}
                disabled={loadingMenu || menuItems.length === 0 || saving}
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
                onClick={addCreateDish}
                disabled={!selectedCreateMenuItemId || saving || loadingMenu}
              >
                ＋ Thêm món
              </button>
            </div>

            {createItems.length === 0 ? (
              <div className="admin-order-empty-items">Chưa có món trong đơn. Chọn món phía trên để thêm.</div>
            ) : (
              <div className="admin-order-item-list">
                {createItems.map((draft) => {
                  const dish = menuItems.find((item) => item.id === draft.menuItemId)
                  if (!dish) return null
                  return (
                    <article className="admin-order-item-row" key={draft.menuItemId}>
                      <div className="admin-order-item-info">
                        {dish.image ? <img src={dish.image} alt="" /> : <div className="admin-order-item-placeholder">MÓN</div>}
                        <div>
                          <strong>{dish.name}</strong>
                          <small>{formatMoney(dish.priceValue)} / phần</small>
                        </div>
                      </div>
                      <div className="admin-order-quantity" aria-label={`Số lượng ${dish.name}`}>
                        <button type="button" onClick={() => changeCreateDishQuantity(dish.id, draft.quantity - 1)} disabled={saving} title="Giảm số lượng">−</button>
                        <span>{draft.quantity}</span>
                        <button type="button" onClick={() => changeCreateDishQuantity(dish.id, draft.quantity + 1)} disabled={saving} title="Tăng số lượng">＋</button>
                      </div>
                      <strong className="admin-order-item-subtotal">{formatMoney(dish.priceValue * draft.quantity)}</strong>
                      <button
                        className="admin-order-remove-item"
                        type="button"
                        onClick={() => changeCreateDishQuantity(dish.id, 0)}
                        disabled={saving}
                        title="Xóa món khỏi đơn"
                      >×</button>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {error && <div className="admin-room-form-notice error">⚠ {error}</div>}

          <div className="admin-order-form-actions">
            <button className="admin-secondary-button" type="button" onClick={() => setCreateOpen(false)} disabled={saving}>
              Hủy
            </button>
            <button className="admin-primary-button" type="submit" disabled={saving || loadingMenu}>
              {saving ? "Đang tạo đơn..." : "Tạo đơn hàng"}
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
            {error && <div className="admin-room-form-notice error">⚠ {error}</div>}
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

      <AdminFormModal
        open={Boolean(paymentOrder)}
        eyebrow="THANH TOÁN"
        title={paymentOrder ? `Ghi nhận thanh toán ${orderLabel(paymentOrder)}` : "Ghi nhận thanh toán"}
        onClose={() => { if (!saving) setPaymentOrder(null) }}
      >
        {paymentOrder && (
          <form className="admin-order-payment-form" onSubmit={submitPayment}>
            <p className="admin-order-payment-total">
              Tổng tiền cần thanh toán: <strong>{formatMoney(Number(paymentOrder.totalAmount || 0))}</strong>
            </p>
            <label>
              <span>Phương thức thanh toán</span>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as OrderPaymentMethod)}
                disabled={saving}
              >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ</option>
              </select>
            </label>
            {paymentError && <div className="admin-room-form-notice error">⚠ {paymentError}</div>}
            <div className="admin-order-form-actions">
              <button className="admin-secondary-button" type="button" onClick={() => setPaymentOrder(null)} disabled={saving}>
                Hủy
              </button>
              <button className="admin-primary-button" type="submit" disabled={saving || Number(paymentOrder.totalAmount || 0) <= 0}>
                {saving ? "Đang lưu..." : "Xác nhận đã thanh toán"}
              </button>
            </div>
          </form>
        )}
      </AdminFormModal>
    </AdminRoomLayout>
  )
}
