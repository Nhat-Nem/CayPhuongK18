import { useEffect, useMemo, useState } from "react"
import AdminFormModal from "@/components/admin/AdminFormModal"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import {
  deleteReview,
  getReviews,
  REVIEW_FEATURED_UPDATED_EVENT,
  updateReviewFeatured,
  type ReviewRecord,
} from "@/services/reviewApi"

type ReviewFilter = "ALL" | "FEATURED" | "NOT_FEATURED"

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] ?? "")
    .join("")
    .toLocaleUpperCase("vi") || "KH"
}

function ratingStars(rating: number) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0))
  return "★".repeat(value) + "☆".repeat(5 - value)
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<ReviewFilter>("ALL")
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null)

  const refreshReviews = async () => {
    setLoading(true)
    setError("")
    try {
      const rows = await getReviews()
      setReviews(Array.isArray(rows) ? rows : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách đánh giá.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshReviews()
  }, [])

  const filteredReviews = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")

    return reviews.filter((review) => {
      if (filter === "FEATURED" && !review.isFeatured) return false
      if (filter === "NOT_FEATURED" && review.isFeatured) return false
      if (!keyword) return true

      return [
        review.id,
        review.customerName,
        review.customerPhone,
        review.customerEmail,
        review.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi")
        .includes(keyword)
    })
  }, [reviews, query, filter])

  const featuredCount = useMemo(
    () => reviews.filter((review) => review.isFeatured).length,
    [reviews],
  )
  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    return reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
  }, [reviews])

  const toggleFeatured = async (review: ReviewRecord) => {
    const nextValue = !review.isFeatured
    setSavingId(review.id)
    setError("")
    setNotice("")

    try {
      const updated = await updateReviewFeatured(review.id, nextValue)
      setReviews((current) => current.map((item) =>
        item.id === review.id ? { ...item, ...updated, isFeatured: nextValue } : item,
      ))
      setSelectedReview((current) => current?.id === review.id
        ? { ...current, ...updated, isFeatured: nextValue }
        : current,
      )
      window.dispatchEvent(new Event(REVIEW_FEATURED_UPDATED_EVENT))
      setNotice(nextValue
        ? `Đã đưa đánh giá của ${review.customerName} lên trang chủ.`
        : `Đã gỡ đánh giá của ${review.customerName} khỏi trang chủ.`,
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể cập nhật trạng thái hiển thị.")
    } finally {
      setSavingId(null)
    }
  }

  const removeReview = async (review: ReviewRecord) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa đánh giá của ${review.customerName}? Thao tác này sẽ xóa đánh giá khỏi hệ thống.`,
    )
    if (!confirmed) return

    setDeletingId(review.id)
    setError("")
    setNotice("")

    try {
      await deleteReview(review.id)
      setReviews((current) => current.filter((item) => item.id !== review.id))
      setSelectedReview((current) => current?.id === review.id ? null : current)
      window.dispatchEvent(new Event(REVIEW_FEATURED_UPDATED_EVENT))
      setNotice("Đã xóa đánh giá.")
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không thể xóa đánh giá.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminRoomLayout
      eyebrow="ĐÁNH GIÁ KHÁCH HÀNG"
      title="Quản lý đánh giá"
      subtitle="Xem phản hồi khách hàng, lựa chọn đánh giá nổi bật trên trang chủ hoặc xóa đánh giá không phù hợp."
    >
      <section className="admin-room-stats admin-review-stats">
        <article>
          <span>TỔNG ĐÁNH GIÁ</span>
          <strong>{reviews.length}</strong>
          <small>Từ khách hàng gửi về</small>
        </article>
        <article>
          <span>ĐANG HIỂN THỊ</span>
          <strong>{featuredCount}</strong>
          <small>Được chọn lên trang chủ</small>
        </article>
        <article>
          <span>ĐIỂM TRUNG BÌNH</span>
          <strong>{reviews.length ? `${averageRating.toFixed(1)}/5` : "—"}</strong>
          <small>Tính từ toàn bộ đánh giá</small>
        </article>
      </section>

      {error && <div className="admin-room-form-notice error" role="alert">⚠ {error}</div>}
      {notice && <div className="admin-review-notice" role="status">✓ {notice}</div>}

      <section className="admin-room-panel">
        <div className="admin-room-toolbar admin-review-toolbar">
          <label className="admin-room-search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, số điện thoại, email hoặc nội dung..."
            />
          </label>
          <select
            aria-label="Lọc đánh giá"
            value={filter}
            onChange={(event) => setFilter(event.target.value as ReviewFilter)}
          >
            <option value="ALL">Tất cả đánh giá</option>
            <option value="FEATURED">Đang hiển thị trang chủ</option>
            <option value="NOT_FEATURED">Chưa hiển thị</option>
          </select>
          <span className="admin-room-result-count">{filteredReviews.length} đánh giá</span>
        </div>

        {loading ? (
          <div className="admin-room-empty"><strong>Đang tải đánh giá...</strong></div>
        ) : filteredReviews.length === 0 ? (
          <div className="admin-room-empty">
            <strong>{reviews.length ? "Không tìm thấy đánh giá phù hợp" : "Chưa có đánh giá"}</strong>
            <span>{reviews.length ? "Thử thay đổi từ khóa hoặc bộ lọc." : "Đánh giá của khách hàng sẽ xuất hiện tại đây sau khi được gửi."}</span>
          </div>
        ) : (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table admin-review-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Ngày gửi</th>
                  <th>Trang chủ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div className="admin-review-customer">
                        <span>{initials(review.customerName)}</span>
                        <div>
                          <strong>{review.customerName}</strong>
                          <small>{review.customerPhone}</small>
                          {review.customerEmail && <small>{review.customerEmail}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-review-stars" aria-label={`${review.rating} trên 5 sao`}>
                        {ratingStars(review.rating)}
                      </span>
                      <small className="admin-review-rating-number">{review.rating}/5</small>
                    </td>
                    <td>
                      <p className="admin-review-note">{review.note?.trim() || "Khách hàng không để lại nội dung."}</p>
                      <button className="admin-review-detail-link" type="button" onClick={() => setSelectedReview(review)}>
                        Xem chi tiết
                      </button>
                    </td>
                    <td><span className="admin-review-date">{formatDateTime(review.createdAt)}</span></td>
                    <td>
                      <span className={`admin-review-status ${review.isFeatured ? "is-featured" : ""}`}>
                        {review.isFeatured ? "Đang hiển thị" : "Chưa hiển thị"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-review-actions">
                        <button
                          className="admin-secondary-button"
                          type="button"
                          disabled={savingId === review.id || deletingId === review.id}
                          onClick={() => void toggleFeatured(review)}
                        >
                          {savingId === review.id
                            ? "Đang lưu..."
                            : review.isFeatured ? "Gỡ khỏi trang chủ" : "Đưa lên trang chủ"}
                        </button>
                        <button
                          className="admin-review-delete"
                          type="button"
                          disabled={savingId === review.id || deletingId === review.id}
                          onClick={() => void removeReview(review)}
                        >
                          {deletingId === review.id ? "Đang xóa..." : "Xóa"}
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
        open={Boolean(selectedReview)}
        eyebrow="CHI TIẾT ĐÁNH GIÁ"
        title={selectedReview ? `Đánh giá từ ${selectedReview.customerName}` : "Chi tiết đánh giá"}
        onClose={() => setSelectedReview(null)}
        size="wide"
      >
        {selectedReview && (
          <div className="admin-review-detail">
            <div className="admin-review-detail-top">
              <div className="admin-review-detail-avatar">{initials(selectedReview.customerName)}</div>
              <div>
                <strong>{selectedReview.customerName}</strong>
                <span>{selectedReview.customerPhone}</span>
                {selectedReview.customerEmail && <span>{selectedReview.customerEmail}</span>}
              </div>
              <span className="admin-review-stars">{ratingStars(selectedReview.rating)}</span>
            </div>
            <p>{selectedReview.note?.trim() || "Khách hàng không để lại nội dung nhận xét."}</p>
            <small>Gửi lúc {formatDateTime(selectedReview.createdAt)}</small>
            <div className="admin-review-detail-actions">
              <button
                className="admin-secondary-button"
                type="button"
                disabled={savingId === selectedReview.id}
                onClick={() => void toggleFeatured(selectedReview)}
              >
                {selectedReview.isFeatured ? "Gỡ khỏi trang chủ" : "Đưa lên trang chủ"}
              </button>
              <button
                className="admin-review-delete"
                type="button"
                disabled={deletingId === selectedReview.id}
                onClick={() => void removeReview(selectedReview)}
              >
                Xóa đánh giá
              </button>
            </div>
          </div>
        )}
      </AdminFormModal>
    </AdminRoomLayout>
  )
}
