import { useEffect, useMemo, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { getAuthenticatedUser } from "@/utils/adminAuth"
import { getOrders, type OrderRecord } from "@/services/orderApi"
import {
  getFoodRevenueReport,
  getRoomStayRevenueRecords,
  type FoodRevenueItem,
  type FoodRevenueResponse,
  type RoomStayRevenueRecord,
} from "@/services/revenueApi"

type RevenueTab = "food" | "hotel" | "restaurant"
type FoodRow = {
  menuItemId: string
  menuItemName: string
  quantitySold: number
  revenue: number
}
type DailyRevenueRow = {
  date: string
  revenue: number
  count: number
}
type RestaurantDailyRow = DailyRevenueRow & { averageOrder: number }

const TAB_LABELS: Record<RevenueTab, string> = {
  food: "Doanh thu món ăn",
  hotel: "Doanh thu khách sạn",
  restaurant: "Tổng doanh thu nhà hàng",
}

function numeric(value: unknown) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)} VNĐ`
}

function dateKey(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function formatDate(value: string | null | undefined) {
  const key = dateKey(value)
  if (!key) return "—"
  const [year, month, day] = key.split("-")
  return `${day}/${month}/${year}`
}

function formatPaymentMethod(value: string | null | undefined) {
  if (value === "CASH") return "Tiền mặt"
  if (value === "BANK_TRANSFER") return "Chuyển khoản"
  if (value === "CARD") return "Thẻ"
  return "—"
}

function isInDateRange(value: string | null | undefined, from: string, to: string) {
  const key = dateKey(value)
  if (!key) return false
  if (from && key < from) return false
  if (to && key > to) return false
  return true
}

function nightsBetween(checkIn: string, checkOut: string | null) {
  if (!checkOut) return 0
  const start = dateKey(checkIn)
  const end = dateKey(checkOut)
  if (!start || !end) return 0
  const [sy, sm, sd] = start.split("-").map(Number)
  const [ey, em, ed] = end.split("-").map(Number)
  const difference = (Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000
  return Math.max(1, Math.round(difference))
}

function groupFoodItems(orders: OrderRecord[]): FoodRow[] {
  const grouped = new Map<string, FoodRow>()

  for (const order of orders) {
    if (order.paymentStatus !== "PAID" || !order.paidAt) continue
    for (const item of order.items ?? []) {
      const id = String(item.menuItemId)
      const current = grouped.get(id) ?? {
        menuItemId: id,
        menuItemName: item.menuItem?.name?.trim() || `Món #${id}`,
        quantitySold: 0,
        revenue: 0,
      }
      const quantity = numeric(item.quantity)
      current.quantitySold += quantity
      current.revenue += quantity * numeric(item.unitPrice)
      grouped.set(id, current)
    }
  }

  return [...grouped.values()].sort((a, b) => b.revenue - a.revenue)
}

function mapFoodRows(items: FoodRevenueItem[] = []): FoodRow[] {
  return items.map((item) => ({
    menuItemId: String(item.menuItemId),
    menuItemName: item.menuItemName,
    quantitySold: numeric(item.quantitySold),
    revenue: numeric(item.revenue),
  }))
}

function buildDailyRows(rows: Array<{ paidAt: string | null; revenue: number }>): DailyRevenueRow[] {
  const grouped = new Map<string, DailyRevenueRow>()
  for (const row of rows) {
    const key = dateKey(row.paidAt)
    if (!key) continue
    const current = grouped.get(key) ?? { date: key, revenue: 0, count: 0 }
    current.revenue += row.revenue
    current.count += 1
    grouped.set(key, current)
  }
  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date))
}

function csvCell(value: string | number) {
  const text = String(value ?? "")
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const content = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
  const blob = new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function buildFilename(tab: RevenueTab, role: "ADMIN" | "STAFF", from: string, to: string) {
  const roleLabel = role === "ADMIN" ? "admin" : "nhan-vien"
  const period = [from || "tu-dau", to || "den-nay"].join("-")
  return `bao-cao-${tab}-${roleLabel}-${period}.csv`
}

export default function AdminRevenueReportPage() {
  const currentUser = getAuthenticatedUser()
  const role = currentUser?.role === "STAFF" ? "STAFF" : "ADMIN"
  const isAdmin = role === "ADMIN"

  const [activeTab, setActiveTab] = useState<RevenueTab>("food")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [roomStays, setRoomStays] = useState<RoomStayRevenueRecord[]>([])
  const [foodReport, setFoodReport] = useState<FoodRevenueResponse | null>(null)
  const [ordersError, setOrdersError] = useState("")
  const [roomStaysError, setRoomStaysError] = useState("")
  const [foodReportError, setFoodReportError] = useState("")
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingRoomStays, setLoadingRoomStays] = useState(true)
  const [loadingFoodReport, setLoadingFoodReport] = useState(isAdmin)

  useEffect(() => {
    let active = true
    getOrders()
      .then((rows) => { if (active) setOrders(rows) })
      .catch((error: Error) => { if (active) setOrdersError(error.message || "Không thể tải danh sách đơn hàng.") })
      .finally(() => { if (active) setLoadingOrders(false) })

    getRoomStayRevenueRecords()
      .then((rows) => { if (active) setRoomStays(rows) })
      .catch((error: Error) => { if (active) setRoomStaysError(error.message || "Không thể tải dữ liệu lưu trú.") })
      .finally(() => { if (active) setLoadingRoomStays(false) })

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      setLoadingFoodReport(false)
      return
    }

    let active = true
    setLoadingFoodReport(true)
    setFoodReportError("")
    getFoodRevenueReport(fromDate || undefined, toDate || undefined)
      .then((report) => { if (active) setFoodReport(report) })
      .catch((error: Error) => {
        if (active) {
          setFoodReport(null)
          setFoodReportError(error.message || "Không thể tải báo cáo doanh thu món ăn.")
        }
      })
      .finally(() => { if (active) setLoadingFoodReport(false) })

    return () => { active = false }
  }, [fromDate, toDate, isAdmin])

  const invalidDateRange = Boolean(fromDate && toDate && fromDate > toDate)

  const paidOrders = useMemo(() => orders.filter((order) =>
    order.paymentStatus === "PAID" &&
    Boolean(order.paidAt) &&
    isInDateRange(order.paidAt, fromDate, toDate),
  ), [orders, fromDate, toDate])

  const paidRoomStays = useMemo(() => roomStays.filter((stay) =>
    stay.paymentStatus === "PAID" &&
    stay.status === "CHECKED_OUT" &&
    Boolean(stay.paidAt) &&
    isInDateRange(stay.paidAt, fromDate, toDate),
  ), [roomStays, fromDate, toDate])

  const derivedFoodRows = useMemo(() => groupFoodItems(paidOrders), [paidOrders])
  const apiFoodRows = useMemo(() => mapFoodRows(foodReport?.items ?? []), [foodReport])
  const foodRows = isAdmin && foodReport ? apiFoodRows : derivedFoodRows
  const foodTotal = isAdmin && foodReport
    ? numeric(foodReport.totalRevenue)
    : foodRows.reduce((total, row) => total + row.revenue, 0)

  const hotelTotal = useMemo(
    () => paidRoomStays.reduce((total, stay) => total + numeric(stay.totalAmount), 0),
    [paidRoomStays],
  )

  const restaurantTotal = useMemo(
    () => paidOrders.reduce((total, order) => total + numeric(order.totalAmount), 0),
    [paidOrders],
  )

  const restaurantDailyRows = useMemo(() => {
    const rows = buildDailyRows(paidOrders.map((order) => ({
      paidAt: order.paidAt,
      revenue: numeric(order.totalAmount),
    })))
    const counts = new Map<string, number>()
    for (const order of paidOrders) {
      const key = dateKey(order.paidAt)
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return rows.map((row) => ({
      ...row,
      count: counts.get(row.date) ?? 0,
      averageOrder: row.count > 0 ? row.revenue / row.count : 0,
    }))
  }, [paidOrders])

  const foodDailyRows = useMemo(() => buildDailyRows(paidOrders.map((order) => ({
    paidAt: order.paidAt,
    revenue: (order.items ?? []).reduce(
      (sum, item) => sum + numeric(item.quantity) * numeric(item.unitPrice),
      0,
    ),
  }))), [paidOrders])

  const hotelDailyRows = useMemo(() => buildDailyRows(paidRoomStays.map((stay) => ({
    paidAt: stay.paidAt,
    revenue: numeric(stay.totalAmount),
  }))), [paidRoomStays])

  const activeTrend: DailyRevenueRow[] = activeTab === "food"
    ? foodDailyRows
    : activeTab === "hotel"
      ? hotelDailyRows
      : restaurantDailyRows
  const trendMaximum = Math.max(1, ...activeTrend.map((row) => row.revenue))

  const foodQuantity = foodRows.reduce((sum, row) => sum + row.quantitySold, 0)
  const uniqueRooms = new Set(paidRoomStays.map((stay) => String(stay.roomId))).size
  const averageRestaurantOrder = paidOrders.length > 0 ? restaurantTotal / paidOrders.length : 0
  const isLoadingActive = activeTab === "food"
    ? (loadingOrders || (isAdmin && loadingFoodReport))
    : activeTab === "hotel"
      ? loadingRoomStays
      : loadingOrders

  const clearDateFilters = () => {
    setFromDate("")
    setToDate("")
  }

  const handleExport = () => {
    if (activeTab === "food") {
      downloadCsv(
        buildFilename(activeTab, role, fromDate, toDate),
        ["Mã món", "Tên món ăn", "Số lượng đã bán", "Doanh thu (VNĐ)"],
        foodRows.map((row) => [row.menuItemId, row.menuItemName, row.quantitySold, row.revenue.toFixed(2)]),
      )
      return
    }

    if (activeTab === "hotel") {
      downloadCsv(
        buildFilename(activeTab, role, fromDate, toDate),
        ["Mã lưu trú", "Mã phòng", "Tên phòng", "Ngày nhận phòng", "Ngày trả phòng", "Ngày thanh toán", "Số đêm", "Phương thức thanh toán", "Doanh thu (VNĐ)"],
        paidRoomStays.map((stay) => [
          stay.id,
          stay.room?.code || stay.roomId,
          stay.room?.name || `Phòng #${stay.roomId}`,
          formatDate(stay.checkInAt),
          formatDate(stay.checkOutAt),
          formatDate(stay.paidAt),
          nightsBetween(stay.checkInAt, stay.checkOutAt),
          formatPaymentMethod(stay.paymentMethod),
          numeric(stay.totalAmount).toFixed(2),
        ]),
      )
      return
    }

    downloadCsv(
      buildFilename(activeTab, role, fromDate, toDate),
      ["Ngày thanh toán", "Số đơn đã thanh toán", "Doanh thu (VNĐ)", "Giá trị trung bình/đơn (VNĐ)"],
      restaurantDailyRows.map((row) => [formatDate(row.date), row.count, row.revenue.toFixed(2), row.averageOrder.toFixed(2)]),
    )
  }

  const dataNotice = activeTab === "food" && !isAdmin
    ? "Báo cáo nhân viên được tổng hợp từ đơn hàng đã thanh toán qua API hiện có."
    : activeTab === "food" && isAdmin && foodReportError
      ? `API báo cáo món ăn chưa phản hồi (${foodReportError}). Tạm hiển thị số liệu tổng hợp từ đơn hàng đã thanh toán.`
      : activeTab === "hotel"
        ? "Doanh thu khách sạn được tính từ lượt lưu trú đã trả phòng và thanh toán thành công."
        : activeTab === "restaurant"
          ? "Tổng doanh thu nhà hàng được tính từ tổng tiền các đơn đã thanh toán."
          : "Số liệu chỉ bao gồm các giao dịch đã thanh toán thành công."

  return (
    <AdminRoomLayout
      eyebrow="BÁO CÁO DOANH THU"
      title="Báo cáo doanh thu"
      subtitle={isAdmin
        ? "Theo dõi doanh thu món ăn, dịch vụ khách sạn và tổng doanh thu nhà hàng."
        : "Xem doanh thu phục vụ công việc theo dõi hoạt động kinh doanh."}
      primaryAction={(
        <button className="admin-primary-button admin-revenue-export" type="button" onClick={handleExport}>
          <span aria-hidden="true">⇩</span> Xuất báo cáo CSV
        </button>
      )}
    >
      <section className="admin-revenue-tabs" aria-label="Chọn loại báo cáo doanh thu">
        {(Object.keys(TAB_LABELS) as RevenueTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`admin-revenue-tab ${activeTab === tab ? "active" : ""}`}
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </section>

      <section className="admin-room-panel admin-revenue-filter-panel">
        <div className="admin-revenue-filter-grid">
          <label>
            <span>TỪ NGÀY</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => setFromDate(event.target.value)}
              aria-label="Ngày bắt đầu báo cáo"
            />
          </label>
          <label>
            <span>ĐẾN NGÀY</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
              aria-label="Ngày kết thúc báo cáo"
            />
          </label>
          <button className="admin-secondary-button" type="button" onClick={clearDateFilters}>
            Xóa bộ lọc ngày
          </button>
        </div>
        {invalidDateRange && (
          <p className="admin-revenue-error">Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.</p>
        )}
      </section>

      <div className="admin-revenue-data-note" role="note">
        <span aria-hidden="true">ⓘ</span>
        <p>{dataNotice}</p>
      </div>

      {activeTab === "food" && foodReportError && isAdmin && (
        <div className="admin-room-form-notice error">Không tải được API báo cáo chính thức. Trang đang dùng dữ liệu đơn hàng đã thanh toán nếu API đơn hàng khả dụng.</div>
      )}
      {activeTab !== "hotel" && ordersError && (
        <div className="admin-room-form-notice error">Không thể tải đơn hàng: {ordersError}</div>
      )}
      {activeTab === "hotel" && roomStaysError && (
        <div className="admin-room-form-notice error">Không thể tải lượt lưu trú: {roomStaysError}</div>
      )}

      <section className="admin-room-stats admin-revenue-stats">
        {activeTab === "food" && (
          <>
            <article>
              <span>TỔNG DOANH THU MÓN ĂN</span>
              <strong>{formatMoney(foodTotal)}</strong>
              <small>Chỉ tính đơn đã thanh toán</small>
            </article>
            <article>
              <span>TỔNG SỐ PHẦN ĐÃ BÁN</span>
              <strong>{new Intl.NumberFormat("vi-VN").format(foodQuantity)}</strong>
              <small>Tổng số lượng các món ăn</small>
            </article>
            <article>
              <span>SỐ MÓN CÓ PHÁT SINH</span>
              <strong>{foodRows.length}</strong>
              <small>Các món có doanh thu trong kỳ</small>
            </article>
          </>
        )}
        {activeTab === "hotel" && (
          <>
            <article>
              <span>TỔNG DOANH THU KHÁCH SẠN</span>
              <strong>{formatMoney(hotelTotal)}</strong>
              <small>Chỉ tính lượt lưu trú đã thanh toán</small>
            </article>
            <article>
              <span>LƯỢT LƯU TRÚ ĐÃ THANH TOÁN</span>
              <strong>{paidRoomStays.length}</strong>
              <small>Đã trả phòng và thanh toán</small>
            </article>
            <article>
              <span>SỐ PHÒNG CÓ DOANH THU</span>
              <strong>{uniqueRooms}</strong>
              <small>Số phòng khác nhau phát sinh doanh thu</small>
            </article>
          </>
        )}
        {activeTab === "restaurant" && (
          <>
            <article>
              <span>TỔNG DOANH THU NHÀ HÀNG</span>
              <strong>{formatMoney(restaurantTotal)}</strong>
              <small>Doanh thu từ các đơn đã thanh toán</small>
            </article>
            <article>
              <span>SỐ ĐƠN ĐÃ THANH TOÁN</span>
              <strong>{paidOrders.length}</strong>
              <small>Đơn có ghi nhận thời điểm thanh toán</small>
            </article>
            <article>
              <span>TRUNG BÌNH MỖI ĐƠN</span>
              <strong>{formatMoney(averageRestaurantOrder)}</strong>
              <small>Doanh thu chia số đơn đã thanh toán</small>
            </article>
          </>
        )}
      </section>

      <section className="admin-room-panel admin-revenue-trend-panel">
        <div className="admin-revenue-section-heading">
          <div>
            <p>THỐNG KÊ THEO NGÀY</p>
            <h2>{TAB_LABELS[activeTab]}</h2>
          </div>
          <span>{activeTrend.length} ngày có phát sinh</span>
        </div>
        {activeTrend.length === 0 ? (
          <div className="admin-room-empty">
            <strong>Chưa có dữ liệu doanh thu trong khoảng thời gian này</strong>
            <span>Thử chọn khoảng ngày khác hoặc kiểm tra các giao dịch đã thanh toán.</span>
          </div>
        ) : (
          <div className="admin-revenue-bars">
            {activeTrend.slice(-14).map((row) => (
              <div className="admin-revenue-bar-row" key={row.date}>
                <span>{formatDate(row.date)}</span>
                <div className="admin-revenue-bar-track">
                  <div className="admin-revenue-bar-fill" style={{ width: `${Math.max(2, row.revenue / trendMaximum * 100)}%` }} />
                </div>
                <strong>{formatMoney(row.revenue)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-room-panel admin-revenue-table-panel">
        <div className="admin-revenue-section-heading">
          <div>
            <p>CHI TIẾT BÁO CÁO</p>
            <h2>{TAB_LABELS[activeTab]}</h2>
          </div>
          <span>
            {activeTab === "food"
              ? `${foodRows.length} món ăn`
              : activeTab === "hotel"
                ? `${paidRoomStays.length} lượt lưu trú`
                : `${restaurantDailyRows.length} ngày`}
          </span>
        </div>
        {isLoadingActive ? (
          <div className="admin-room-empty"><strong>Đang tải dữ liệu doanh thu...</strong></div>
        ) : invalidDateRange ? (
          <div className="admin-room-empty"><strong>Khoảng ngày không hợp lệ</strong></div>
        ) : activeTab === "food" ? (
          foodRows.length === 0 ? (
            <div className="admin-room-empty"><strong>Chưa có doanh thu món ăn trong kỳ</strong></div>
          ) : (
            <div className="admin-room-table-wrap">
              <table className="admin-room-table admin-revenue-table">
                <thead><tr><th>Món ăn</th><th>Số lượng đã bán</th><th>Doanh thu</th></tr></thead>
                <tbody>
                  {foodRows.map((row) => (
                    <tr key={row.menuItemId}>
                      <td><strong>{row.menuItemName}</strong><small className="admin-order-cell-subtext">Mã món: {row.menuItemId}</small></td>
                      <td>{new Intl.NumberFormat("vi-VN").format(row.quantitySold)}</td>
                      <td><strong className="admin-revenue-money">{formatMoney(row.revenue)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === "hotel" ? (
          paidRoomStays.length === 0 ? (
            <div className="admin-room-empty"><strong>Chưa có doanh thu khách sạn trong kỳ</strong></div>
          ) : (
            <div className="admin-room-table-wrap">
              <table className="admin-room-table admin-revenue-table">
                <thead><tr><th>Lượt lưu trú</th><th>Phòng</th><th>Nhận phòng</th><th>Trả phòng</th><th>Thanh toán</th><th>Số đêm</th><th>Doanh thu</th></tr></thead>
                <tbody>
                  {paidRoomStays.map((stay) => (
                    <tr key={String(stay.id)}>
                      <td><strong>#{stay.id}</strong></td>
                      <td><strong>{stay.room?.name || `Phòng #${stay.roomId}`}</strong><small className="admin-order-cell-subtext">{stay.room?.code || `ID ${stay.roomId}`}</small></td>
                      <td>{formatDate(stay.checkInAt)}</td>
                      <td>{formatDate(stay.checkOutAt)}</td>
                      <td>{formatDate(stay.paidAt)}<small className="admin-order-cell-subtext">{formatPaymentMethod(stay.paymentMethod)}</small></td>
                      <td>{nightsBetween(stay.checkInAt, stay.checkOutAt)}</td>
                      <td><strong className="admin-revenue-money">{formatMoney(numeric(stay.totalAmount))}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : restaurantDailyRows.length === 0 ? (
          <div className="admin-room-empty"><strong>Chưa có doanh thu nhà hàng trong kỳ</strong></div>
        ) : (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-revenue-table">
              <thead><tr><th>Ngày thanh toán</th><th>Số đơn đã thanh toán</th><th>Doanh thu</th><th>Trung bình/đơn</th></tr></thead>
              <tbody>
                {restaurantDailyRows.map((row) => (
                  <tr key={row.date}>
                    <td><strong>{formatDate(row.date)}</strong></td>
                    <td>{row.count}</td>
                    <td><strong className="admin-revenue-money">{formatMoney(row.revenue)}</strong></td>
                    <td>{formatMoney(row.averageOrder)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="admin-revenue-footnote">
        Báo cáo dùng thời điểm thanh toán (paidAt) và chỉ cộng giao dịch có trạng thái PAID. Dữ liệu hiển thị phụ thuộc vào các giao dịch backend đã ghi nhận.
      </p>
    </AdminRoomLayout>
  )
}
