import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import {
  getDatabaseImageFor,
  getDatabaseSiteImages,
  type DatabaseSiteImage,
} from "@/services/siteMediaApi"

type HeroProps = {
  /** Asset local dùng làm phương án dự phòng khi backend chưa có ảnh. */
  image: string
  title: string
  subtitle?: string
}

const DEFAULT_HOME_IMAGES = ["06f7b.png", "1277f.png", "8e9ad.png"]

function getPreferredImageKind(title: string): "room" | "dish" | "mixed" {
  const normalized = title.toLocaleUpperCase("vi")
  if (normalized.includes("PHÒNG") || normalized.includes("LƯU TRÚ")) return "room"
  if (normalized.includes("ẨM THỰC") || normalized.includes("THỰC ĐƠN")) return "dish"
  return "mixed"
}

export default function Hero({ image, title, subtitle }: HeroProps) {
  const isHomeHero = title === "CÂY PHƯỢNG K18"
  const [homeSlide, setHomeSlide] = useState(0)
  const [databaseImages, setDatabaseImages] = useState<DatabaseSiteImage[]>([])

  useEffect(() => {
    let active = true
    getDatabaseSiteImages()
      .then((images) => {
        if (active) setDatabaseImages(images)
      })
      .catch(() => {
        if (active) setDatabaseImages([])
      })

    return () => {
      active = false
    }
  }, [])

  const homeDatabaseImages = databaseImages
    .filter((item) => item.kind === "dish" || item.kind === "room")
    .map((item) => item.src)
    .filter((src, index, all) => all.indexOf(src) === index)
    .slice(0, 5)
  const homeImages = homeDatabaseImages.length > 0
    ? homeDatabaseImages
    : DEFAULT_HOME_IMAGES.map((asset) => `${A}${asset}`)

  const preferredImage = getDatabaseImageFor(databaseImages, getPreferredImageKind(title))
  const backgroundImage = preferredImage?.src ?? `${A}${image}`

  useEffect(() => {
    if (!isHomeHero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const timer = window.setInterval(() => {
      setHomeSlide((current) => (current + 1) % homeImages.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [isHomeHero, homeImages.length])

  useEffect(() => {
    setHomeSlide(0)
  }, [homeImages.length])

  return (
    <section
      className={`hero ${isHomeHero ? "home-hero" : ""}`}
      style={isHomeHero ? undefined : { backgroundImage: `url("${backgroundImage}")` }}
    >
      {isHomeHero && (
        <div className="home-hero-backgrounds" aria-hidden="true">
          {homeImages.map((homeImage, index) => (
            <span
              className={homeSlide === index ? "active" : ""}
              style={{ backgroundImage: `url("${homeImage}")` }}
              key={homeImage}
            />
          ))}
        </div>
      )}
      <div className="hero-overlay" />
      <div className="hero-copy">
        {isHomeHero && <span className="hero-kicker">NHÀ HÀNG &amp; HOMESTAY</span>}
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
