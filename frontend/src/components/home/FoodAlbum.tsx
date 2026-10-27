import { useEffect, useState } from "react"
import ButtonLink from "@/components/common/ButtonLink"
import { getDatabaseSiteImages, type DatabaseSiteImage } from "@/services/siteMediaApi"

export default function FoodAlbum() {
  const [pages, setPages] = useState<DatabaseSiteImage[]>([])
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<"next" | "previous">("next")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getDatabaseSiteImages()
      .then((images) => {
        if (active) setPages(images.filter((image) => image.kind === "dish"))
      })
      .catch(() => {
        if (active) setPages([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const turnPage = (nextPage: number, nextDirection: "next" | "previous") => {
    setDirection(nextDirection)
    setPage((nextPage + pages.length) % pages.length)
  }

  const current = pages[page]
  const next = pages[(page + 1) % pages.length]

  return (
    <section id="trai-nghiem" className="section food-album-section">
      <div className="food-album-heading home-title-reveal">
        <div>
          <p className="eyebrow">ẨM THỰC</p>
          <h2>Hương vị trong từng trang</h2>
        </div>
        <p>
          Hình ảnh món ăn được lấy từ các món đã lưu trong cơ sở dữ liệu, giúp
          album tự cập nhật khi quản trị viên thêm hoặc thay đổi ảnh thực đơn.
        </p>
      </div>

      {loading ? (
        <div className="career-data-notice">Đang tải ảnh món ăn từ cơ sở dữ liệu...</div>
      ) : pages.length === 0 ? (
        <div className="career-data-notice">
          Chưa có ảnh món ăn trong cơ sở dữ liệu. Hãy thêm ảnh cho món trong trang quản trị để hiển thị album.
        </div>
      ) : (
        <div className="food-album">
          <button
            className="album-arrow album-arrow-previous"
            onClick={() => turnPage(page - 1, "previous")}
            aria-label="Lật về trang trước"
            disabled={pages.length < 2}
          >
            ←
          </button>
          <div
            className={`album-spread album-turn-${direction}`}
            key={`${page}-${direction}`}
          >
            <article className="album-page album-page-left">
              <span className="album-page-number">{String(page + 1).padStart(2, "0")}</span>
              <img src={current.src} alt={current.title} />
              <div className="album-photo-caption">
                <span>{current.category || "Thực đơn Cây Phượng K18"}</span>
                <strong>{current.title}</strong>
              </div>
            </article>
            <article className="album-page album-page-right">
              <div className="album-page-copy">
                <span className="script">Thưởng thức</span>
                <p className="eyebrow">{current.category || "Ẩm thực"}</p>
                <h3>{current.title}</h3>
                <p>{current.description || "Khám phá món ăn trong thực đơn Cây Phượng K18."}</p>
                <ButtonLink href="/menu">Khám phá thực đơn</ButtonLink>
              </div>
              {next && (
                <div className="album-next-preview">
                  <img src={next.src} alt={next.title} />
                  <span>Trang tiếp theo · {next.title}</span>
                </div>
              )}
            </article>
          </div>
          <button
            className="album-arrow album-arrow-next"
            onClick={() => turnPage(page + 1, "next")}
            aria-label="Lật sang trang tiếp theo"
            disabled={pages.length < 2}
          >
            →
          </button>
        </div>
      )}
    </section>
  )
}
