import { useEffect, useState } from "react"

const testimonials = [
  {
    name: "Chị Lan Phương",
    stars: 5,
    text: "Cá lóc nướng muối ớt ở đây ngon xuất sắc! Không gian rất thoáng và yên tĩnh, nhân viên nhiệt tình chu đáo. Cả gia đình mình ai cũng thích, nhất định sẽ quay lại.",
    initials: "LP",
  },
  {
    name: "Anh Minh Tuấn",
    stars: 5,
    text: "Mâm cơm Cây Phượng đúng như tên gọi — đầy đặn, thơm ngon và rất hợp vị. Gà ta nướng lu ăn kèm muối ớt xanh thật tuyệt. Giá cả hợp lý, phục vụ rất tốt.",
    initials: "MT",
  },
  {
    name: "Gia đình Bảo Châu",
    stars: 5,
    text: "Lần đầu đến Cây Phượng K18 cho dịp sinh nhật ba, được phục vụ rất chu đáo. Bánh canh Trảng Bàng sợi dai ngon, nước dùng trong và ngọt tự nhiên. Sẽ giới thiệu cho bạn bè.",
    initials: "BC",
  },
  {
    name: "Chị Thu Hà",
    stars: 5,
    text: "Không gian xanh mát, thoáng đãng — ăn cơm mà như đang ngồi giữa vườn. Bò cuốn lá lốt thơm lừng, chấm mắm nêm đúng vị miền Nam. Quán giữ được nét mộc mạc rất đáng quý.",
    initials: "TH",
  },
]

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [paused])

  const showTestimonial = (next: number) => {
    setActive((next + testimonials.length) % testimonials.length)
  }

  return (
    <section className="section testimonials-section">
      <div className="testimonials-heading home-title-reveal">
        <p className="eyebrow">ĐÁNH GIÁ</p>
        <h2>Khách hàng nói gì về chúng tôi</h2>
        <p>Những cảm nhận chân thật từ thực khách đã trải nghiệm ẩm thực và không gian tại Cây Phượng K18.</p>
      </div>
      <div
        className="testimonials-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <button
          className="testimonial-arrow"
          onClick={() => showTestimonial(active - 1)}
          aria-label="Xem đánh giá trước"
        >
          ←
        </button>
        <div className="testimonials-viewport" aria-live="polite">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {testimonials.map((t, i) => (
              <article
                key={t.name}
                className={`testimonial-card${i === active ? " testimonial-active" : ""}`}
                aria-hidden={i !== active}
              >
                <div className="testimonial-stars">
                  {"★".repeat(t.stars)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <strong>{t.name}</strong>
                  </div>
                </div>
                <span className="testimonial-number">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(testimonials.length).padStart(2, "0")}
                </span>
              </article>
            ))}
          </div>
        </div>
        <button
          className="testimonial-arrow"
          onClick={() => showTestimonial(active + 1)}
          aria-label="Xem đánh giá tiếp theo"
        >
          →
        </button>
      </div>
      <div className="testimonial-dots" aria-label="Chọn đánh giá">
        {testimonials.map((testimonial, index) => (
          <button
            className={index === active ? "active" : ""}
            onClick={() => showTestimonial(index)}
            aria-label={`Xem đánh giá của ${testimonial.name}`}
            aria-pressed={index === active}
            key={testimonial.name}
          />
        ))}
      </div>
    </section>
  )
}


