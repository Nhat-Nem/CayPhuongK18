import { useState, type FormEvent } from "react"
import Hero from "@/components/common/Hero"
import Shell from "@/components/layout/Shell"
import { createReview } from "@/services/contactFormsApi"

type ReviewFormState = {
  customerName: string
  customerPhone: string
  customerEmail: string
  note: string
}

const INITIAL_FORM: ReviewFormState = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  note: "",
}

export default function ReviewPage() {
  const [form, setForm] = useState<ReviewFormState>(INITIAL_FORM)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [reviewCode, setReviewCode] = useState("")

  const updateField = (field: keyof ReviewFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (rating < 1 || rating > 5) {
      setError("Vui lòng chọn mức đánh giá từ 1 đến 5 sao.")
      return
    }

    setSubmitting(true)
    try {
      const result = await createReview({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim(),
        rating,
        note: form.note.trim(),
      })

      setReviewCode(result.id ? `DG-${String(result.id).padStart(6, "0")}` : "")
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đánh giá. Vui lòng thử lại.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Shell>
      <Hero
        image="8e9ad.png"
        title="Chia sẻ trải nghiệm"
        subtitle="Mỗi góp ý của bạn giúp Cây Phượng K18 phục vụ tốt hơn."
      />

      <section className="review-submit-section">
        <div className="review-submit-intro">
          <p className="eyebrow">ĐÁNH GIÁ DỊCH VỤ</p>
          <h2>Trải nghiệm của bạn là điều chúng tôi trân trọng</h2>
          <p>
            Hãy chia sẻ cảm nhận sau khi sử dụng dịch vụ ăn uống hoặc lưu trú tại
            Cây Phượng K18. Đánh giá sẽ được gửi đến đội ngũ quản lý để xem xét.
          </p>
          <div className="review-submit-points">
            <span><b>01</b> Chọn số sao phù hợp với trải nghiệm</span>
            <span><b>02</b> Điền thông tin liên hệ</span>
            <span><b>03</b> Gửi nhận xét đến Cây Phượng K18</span>
          </div>
        </div>

        <div className="review-submit-card">
          {reviewCode ? (
            <div className="review-submit-success" role="status">
              <div className="review-success-icon" aria-hidden="true">✓</div>
              <p className="eyebrow">ĐÃ GỬI THÀNH CÔNG</p>
              <h2>Cảm ơn bạn đã đánh giá!</h2>
              <p>
                Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn đã dành thời gian
                chia sẻ trải nghiệm cùng Cây Phượng K18.
              </p>
              {reviewCode && <strong className="review-receipt-code">Mã đánh giá: {reviewCode}</strong>}
              <a className="admin-primary-button review-back-home" href="/">Về trang chủ</a>
              <button
                className="review-send-another"
                type="button"
                onClick={() => {
                  setForm(INITIAL_FORM)
                  setRating(0)
                  setReviewCode("")
                }}
              >
                Gửi đánh giá khác
              </button>
            </div>
          ) : (
            <form className="review-submit-form" onSubmit={submitReview}>
              <div className="review-form-heading">
                <span>ĐÁNH GIÁ CỦA BẠN</span>
                <h2>Cho chúng tôi biết cảm nhận nhé</h2>
              </div>

              <fieldset className="review-rating-fieldset">
                <legend>Mức độ hài lòng <b>*</b></legend>
                <div className="review-rating-stars" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className={(hoveredRating || rating) >= value ? "active" : ""}
                      type="button"
                      aria-label={`${value} trên 5 sao`}
                      aria-pressed={rating === value}
                      onMouseEnter={() => setHoveredRating(value)}
                      onFocus={() => setHoveredRating(value)}
                      onBlur={() => setHoveredRating(0)}
                      onClick={() => setRating(value)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <small>{rating ? `${rating}/5 sao` : "Chạm hoặc chọn số sao để đánh giá"}</small>
              </fieldset>

              <div className="review-form-fields">
                <label>
                  <span>Họ và tên <b>*</b></span>
                  <input
                    name="customerName"
                    type="text"
                    autoComplete="name"
                    maxLength={255}
                    required
                    value={form.customerName}
                    onChange={(event) => updateField("customerName", event.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </label>
                <label>
                  <span>Số điện thoại <b>*</b></span>
                  <input
                    name="customerPhone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={15}
                    required
                    value={form.customerPhone}
                    onChange={(event) => updateField("customerPhone", event.target.value)}
                    placeholder="Nhập số điện thoại (tối đa 15 ký tự)"
                  />
                </label>
                <label className="review-form-full">
                  <span>Email <small>(không bắt buộc)</small></span>
                  <input
                    name="customerEmail"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    value={form.customerEmail}
                    onChange={(event) => updateField("customerEmail", event.target.value)}
                    placeholder="example@email.com"
                  />
                </label>
                <label className="review-form-full">
                  <span>Nhận xét <small>(không bắt buộc)</small></span>
                  <textarea
                    name="note"
                    rows={5}
                    maxLength={2000}
                    value={form.note}
                    onChange={(event) => updateField("note", event.target.value)}
                    placeholder="Chia sẻ điều bạn hài lòng hoặc điều chúng tôi có thể cải thiện..."
                  />
                  <small className="review-note-counter">{form.note.length}/2000 ký tự</small>
                </label>
              </div>

              {error && <div className="review-submit-error" role="alert">{error}</div>}

              <button className="review-submit-button" type="submit" disabled={submitting}>
                {submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
                <span aria-hidden="true">→</span>
              </button>
              <p className="review-privacy-note">
                Thông tin được gửi đến hệ thống Cây Phượng K18 để tiếp nhận đánh giá.
              </p>
            </form>
          )}
        </div>
      </section>
    </Shell>
  )
}
