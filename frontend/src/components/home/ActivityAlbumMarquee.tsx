import { useEffect, useState } from "react"
import { getDatabaseSiteImages, type DatabaseSiteImage } from "@/services/siteMediaApi"

export default function ActivityAlbumMarquee() {
  const [images, setImages] = useState<DatabaseSiteImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getDatabaseSiteImages()
      .then((rows) => {
        if (active) setImages(rows.slice(0, 12))
      })
      .catch(() => {
        if (active) setImages([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const albumRows = [images, [...images].reverse()]

  return (
    <section className="guest-album-section">
      <div className="guest-gallery-heading home-title-reveal">
        <p className="eyebrow">HÌNH ẢNH ĐƯỢC QUẢN LÝ QUA DỮ LIỆU</p>
        <h2>Không gian &amp; ẩm thực</h2>
      </div>
      {loading ? (
        <div className="career-data-notice">Đang tải ảnh từ cơ sở dữ liệu...</div>
      ) : images.length === 0 ? (
        <div className="career-data-notice">
          Chưa có ảnh phòng hoặc món ăn được lưu trong cơ sở dữ liệu để hiển thị tại đây.
        </div>
      ) : (
        <div className="guest-album-marquee">
          {albumRows.map((row, rowIndex) => (
            <div className="guest-album-row" key={`album-row-${rowIndex}`}>
              <div className={`guest-album-track ${rowIndex === 1 ? "reverse" : ""}`}>
                {[0, 1].map((copyIndex) => (
                  <div
                    className="guest-album-sequence"
                    aria-hidden={copyIndex === 1}
                    key={`album-sequence-${rowIndex}-${copyIndex}`}
                  >
                    {row.map((item, imageIndex) => (
                      <figure
                        className={`guest-album-photo guest-album-photo-${imageIndex % 3}`}
                        key={`album-photo-${rowIndex}-${copyIndex}-${item.id}`}
                      >
                        <img src={item.src} alt={`${item.title} — ${item.kind === "room" ? "phòng nghỉ" : "món ăn"}`} loading="lazy" />
                      </figure>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
