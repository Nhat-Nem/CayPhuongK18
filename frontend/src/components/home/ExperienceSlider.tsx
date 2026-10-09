import { useEffect, useState } from "react"
import albumActivity1 from "@/imports/album-activity-1.jpg"
import albumActivity2 from "@/imports/album-activity-2.jpg"
import albumActivity3 from "@/imports/album-activity-3.jpg"
import albumActivity4 from "@/imports/album-activity-4.jpg"
import albumActivity5 from "@/imports/album-activity-5.jpg"
import albumActivity6 from "@/imports/album-activity-6.jpg"

const experienceSlides = [
  {
    image: albumActivity1,
    kicker: "Ẩm thực",
    title: "Khoảnh khắc quây quần bên bàn ăn",
  },
  {
    image: albumActivity2,
    kicker: "Hoạt động",
    title: "Khám phá nhịp sống địa phương",
  },
  {
    image: albumActivity3,
    kicker: "Trải nghiệm",
    title: "Ghé thăm khu chợ quê gần gũi",
  },
  {
    image: albumActivity4,
    kicker: "Văn hóa",
    title: "Chạm vào nét đẹp bản địa Tây Ninh",
  },
  {
    image: albumActivity5,
    kicker: "Phong cảnh",
    title: "Thư giãn bên hồ nước thanh bình",
  },
  {
    image: albumActivity6,
    kicker: "Thiên nhiên",
    title: "Dạo bước giữa khu vườn xanh mát",
  },
]

export default function ExperienceSlider() {
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % experienceSlides.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [paused])

  const showSlide = (nextSlide: number) => {
    setSlide(
      (nextSlide + experienceSlides.length) % experienceSlides.length,
    )
  }

  return (
    <section className="experience-slider-section">
      <div className="experience-slider-heading home-title-reveal">
        <div>
          <p className="eyebrow">TRẢI NGHIỆM</p>
          <h2>Những khoảnh khắc tại Cây Phượng K18</h2>
        </div>
        <p>
          Từ cảnh sắc yên bình đến những hoạt động gần gũi, mỗi khoảnh khắc đều
          góp phần tạo nên một chuyến đi đáng nhớ.
        </p>
      </div>

      <div
        className="experience-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="experience-track"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {experienceSlides.map((item, index) => (
            <article className="experience-slide" key={item.title}>
              <img src={item.image} alt={item.title} />
              <div className="experience-slide-overlay" />
              <div className="experience-slide-copy">
                <span>{item.kicker}</span>
                <h3>{item.title}</h3>
                <small>
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(experienceSlides.length).padStart(2, "0")}
                </small>
              </div>
            </article>
          ))}
        </div>
        <div className="experience-controls">
          <button
            onClick={() => showSlide(slide - 1)}
            aria-label="Xem hình ảnh trước"
          >
            ←
          </button>
          <button
            onClick={() => showSlide(slide + 1)}
            aria-label="Xem hình ảnh tiếp theo"
          >
            →
          </button>
        </div>
      </div>

      <div className="experience-dots" aria-label="Chọn hình ảnh trải nghiệm">
        {experienceSlides.map((item, index) => (
          <button
            className={slide === index ? "active" : ""}
            onClick={() => showSlide(index)}
            aria-label={`Xem ảnh: ${item.title}`}
            aria-pressed={slide === index}
            key={item.title}
          />
        ))}
      </div>
    </section>
  )
}

