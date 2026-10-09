import { useEffect, useState } from "react"
import { A } from "@/config/assets"

type HeroProps = {
  image: string
  title: string
  subtitle?: string
}


export default function Hero({ image, title, subtitle }: HeroProps) {
  const isHomeHero = title === "CÂY PHƯỢNG K18"
  const homeImages = ["06f7b.png", "1277f.png", "8e9ad.png"]
  const [homeSlide, setHomeSlide] = useState(0)

  useEffect(() => {
    if (!isHomeHero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const timer = window.setInterval(() => {
      setHomeSlide((current) => (current + 1) % homeImages.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [isHomeHero, homeImages.length])

  return (
    <section
      className={`hero ${isHomeHero ? "home-hero" : ""}`}
      style={isHomeHero ? undefined : { backgroundImage: `url("${A}${image}")` }}
    >
      {isHomeHero && (
        <div className="home-hero-backgrounds" aria-hidden="true">
          {homeImages.map((homeImage, index) => (
            <span
              className={homeSlide === index ? "active" : ""}
              style={{ backgroundImage: `url("${A}${homeImage}")` }}
              key={homeImage}
            />
          ))}
        </div>
      )}
      <div className="hero-overlay" />
      <div className="hero-copy">
        {isHomeHero && (
          <span className="hero-kicker">NHÀ HÀNG &amp; HOMESTAY</span>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {isHomeHero && (
          <div className="hero-actions">
            <a className="hero-primary" href="/lien-he?type=table">
              Đặt bàn ngay
            </a>
          </div>
        )}
      </div>
      {isHomeHero && (
        <div className="home-hero-pagination" aria-label="Chọn ảnh nền trang chủ">
          {homeImages.map((homeImage, index) => (
            <button
              className={homeSlide === index ? "active" : ""}
              onClick={() => setHomeSlide(index)}
              aria-label={`Xem ảnh nền ${index + 1}`}
              aria-pressed={homeSlide === index}
              key={homeImage}
            />
          ))}
        </div>
      )}
    </section>
  )
}

