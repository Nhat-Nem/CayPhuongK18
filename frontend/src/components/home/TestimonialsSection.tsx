import { useEffect, useMemo, useState } from "react"
import { getReviews, type ReviewRecord } from "@/services/reviewApi"
import {
  FEATURED_REVIEWS_UPDATED_EVENT,
  getFeaturedReviewIds,
} from "@/services/featuredReviewsStore"

type Testimonial = {
  id: string
  name: string
  stars: number
  text: string
  initials: string
  service: string
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: "sample-lan-phuong",
    name: "Chị Lan Phương",
    stars: 5,
    text: "Cá lóc nướng muối ớt ở đây ngon xuất sắc! Không gian rất thoáng và yên tĩnh, nhân viên nhiệt tình chu đáo. Cả gia đình mình ai cũng thích, nhất định sẽ quay lại.",
    initials: "LP",
    service: "Ẩm thực",
  },
  {
    id: "sample-minh-tuan",
    name: "Anh Minh Tuấn",
    stars: 5,
    text: "Mâm cơm Cây Phượng đúng như tên gọi — đầy đặn, thơm ngon và rất hợp vị. Gà ta nướng lu ăn kèm muối ớt xanh thật tuyệt. Giá cả hợp lý, phục vụ rất tốt.",
    initials: "MT",
    service: "Ẩm thực",
  },
  {
    id: "sample-bao-chau",
    name: "Gia đình Bảo Châu",
    stars: 5,
    text: "Lần đầu đến Cây Phượng K18 cho dịp sinh nhật ba, được phục vụ rất chu đáo. Bánh canh Trảng Bàng sợi dai ngon, nước dùng trong và ngọt tự nhiên. Sẽ giới thiệu cho bạn bè.",
    initials: "BC",
    service: "Dịch vụ",
  },
  {
    id: "sample-thu-ha",
    name: "Chị Thu Hà",
    stars: 5,
    text: "Không gian xanh mát, thoáng đãng — ăn cơm mà như đang ngồi giữa vườn. Bò cuốn lá lốt thơm lừng, chấm mắm nêm đúng vị miền Nam. Quán giữ được nét mộc mạc rất đáng quý.",
    initials: "TH",
    service: "Phòng nghỉ",
  },
]

function normalizeReview(review: ReviewRecord): Testimonial {
  const name = review.customerName?.trim() || "Khách hàng"
  const initials = name
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0] ?? "")
    .join("")
    .toLocaleUpperCase("vi")
  return {
    id: String(review.id),
    name,
    stars: Math.max(1, Math.min(5, Number(review.rating) || 5)),
    text: review.note?.trim() || `Khách hàng đánh giá dịch vụ ${review.rating}/5 sao.`,
    initials: initials || "KH",
    service: "Khách hàng",
  }
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [reviewsLoaded, setReviewsLoaded] = useState(false)
  const [reviewsApiFailed, setReviewsApiFailed] = useState(false)
  const [featuredIds, setFeaturedIds] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    getReviews()
      .then((rows) => {
        if (mounted) {
          setReviews(rows)
          setReviewsLoaded(true)
        }
      })
      .catch(() => {
        // Chỉ dùng nội dung mẫu khi API không truy cập được.
        if (mounted) setReviewsApiFailed(true)
      })

    const syncFeatured = () => {
      setFeaturedIds(getFeaturedReviewIds())
      setActive(0)
    }
    syncFeatured()
    window.addEventListener(FEATURED_REVIEWS_UPDATED_EVENT, syncFeatured)
    window.addEventListener("storage", syncFeatured)
    return () => {
      mounted = false
      window.removeEventListener(FEATURED_REVIEWS_UPDATED_EVENT, syncFeatured)
      window.removeEventListener("storage", syncFeatured)
    }
  }, [])

  const featuredTestimonials = useMemo(
    () => reviews
      .filter((review) => featuredIds.includes(String(review.id)))
      .map(normalizeReview),
    [reviews, featuredIds],
  )
  const useFallbackTestimonials = !reviewsLoaded
  const testimonials = reviewsLoaded && !reviewsApiFailed
    ? featuredTestimonials
    : fallbackTestimonials
  const averageRating = featuredTestimonials.length
    ? featuredTestimonials.reduce((sum, item) => sum + item.stars, 0) / featuredTestimonials.length
    : (useFallbackTestimonials || reviewsApiFailed ? 4.9 : 0)
  const reviewCount = featuredTestimonials.length || (useFallbackTestimonials || reviewsApiFailed ? 128 : 0)
  const activeIndex = testimonials.length ? active % testimonials.length : 0

  useEffect(() => {
    if (paused || testimonials.length <= 1) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [paused, testimonials.length])

  const showTestimonial = (next: number) => {
    setActive((next + testimonials.length) % testimonials.length)
  }

  const shownTestimonials = [
    ...testimonials.slice(activeIndex),
    ...testimonials.slice(0, activeIndex),
  ]

  return (
    <section className="section testimonials-section">
      <div className="testimonials-heading home-title-reveal">
        <h2 className="single-line-heading">Những trải nghiệm đáng nhớ</h2>
        <p>
          Khám phá những điều thực khách yêu thích sau mỗi bữa ăn và kỳ nghỉ
          tại Cây Phượng.
        </p>
      </div>

      <div
        className="reviews-overall"
        aria-label={featuredTestimonials.length ? `Điểm đánh giá ${averageRating.toFixed(1)} trên 5` : "Chưa có đánh giá nổi bật"}
      >
        <strong>{featuredTestimonials.length || reviewsApiFailed ? averageRating.toFixed(1) : "—"}<small>/5</small></strong>
        <div>
          {testimonials.length > 0 && (
            <span className="reviews-overall-stars" aria-hidden="true">★★★★★</span>
          )}
          <p>
            {featuredTestimonials.length
              ? `Dựa trên ${featuredTestimonials.length} đánh giá được chọn`
              : useFallbackTestimonials || reviewsApiFailed
                ? "Dựa trên 128 đánh giá mẫu"
                : "Chưa có đánh giá được chọn hiển thị"}
          </p>
        </div>
      </div>

      <div
        className="testimonials-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {shownTestimonials.length ? (
          <div className="testimonials-grid">
            {shownTestimonials.slice(0, 3).map((testimonial) => (
              <article className="testimonial-card" key={testimonial.id}>
                <div className="testimonial-stars" role="img" aria-label={`${testimonial.stars} trên 5 sao`}>
                  <span aria-hidden="true">{"★".repeat(testimonial.stars)}</span>
                </div>
                <p className="testimonial-text">“{testimonial.text}”</p>
                <div className="testimonial-card-footer">
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{testimonial.initials}</div>
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.service}</span>
                    </div>
                  </div>
                  <div className="verified-guest"><span aria-hidden="true">✓</span> Đã gửi đánh giá</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="testimonials-empty-state">
            <strong>Chưa có đánh giá nổi bật</strong>
            <p>Những đánh giá do Admin chọn sẽ được hiển thị tại đây.</p>
          </div>
        )}
      </div>

      <div className="slider-dots" aria-label="Chọn đánh giá">
        {testimonials.map((testimonial, index) => (
          <button
            className={index === activeIndex ? "active" : ""}
            onClick={() => showTestimonial(index)}
            aria-label={`Xem đánh giá của ${testimonial.name}`}
            aria-pressed={index === activeIndex}
            key={testimonial.id}
          />
        ))}
      </div>
      <div className="testimonials-write-review">
        <a href="/danh-gia">Chia sẻ trải nghiệm của bạn <span aria-hidden="true">→</span></a>
      </div>
    </section>
  )
}
