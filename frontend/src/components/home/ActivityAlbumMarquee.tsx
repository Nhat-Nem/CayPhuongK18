import albumActivity1 from "@/imports/album-activity-1.jpg"
import albumActivity2 from "@/imports/album-activity-2.jpg"
import albumActivity3 from "@/imports/album-activity-3.jpg"
import albumActivity4 from "@/imports/album-activity-4.jpg"
import albumActivity5 from "@/imports/album-activity-5.jpg"
import albumActivity6 from "@/imports/album-activity-6.jpg"

const guestVisitSlides = [
  {
    image: albumActivity1,
    alt: "Không gian nhà hàng được chuẩn bị cho buổi tiệc",
  },
  {
    image: albumActivity2,
    alt: "Nhóm khách tham dự tiệc tại nhà hàng",
  },
  {
    image: albumActivity3,
    alt: "Bàn tiệc dài trong không gian nhà hàng mái lá",
  },
  {
    image: albumActivity4,
    alt: "Không gian sự kiện bên hồ tại Cây Phượng K18",
  },
  {
    image: albumActivity5,
    alt: "Toàn cảnh khu vực tổ chức tiệc về đêm",
  },
  {
    image: albumActivity6,
    alt: "Khách tham quan chụp ảnh cùng cá tại khu nhà hàng",
  },
]

export default function ActivityAlbumMarquee() {
  const albumRows = [guestVisitSlides, [...guestVisitSlides].reverse()]

  return (
    <section className="guest-album-section">
      <div className="guest-gallery-heading home-title-reveal">
        <p className="eyebrow">KHOẢNH KHẮC TẠI QUÁN</p>
        <h2>Album Hoạt Động</h2>
      </div>
      <div className="guest-album-marquee">
        {albumRows.map((row, rowIndex) => (
          <div className="guest-album-row" key={`album-row-${rowIndex}`}>
            <div
              className={`guest-album-track ${rowIndex === 1 ? "reverse" : ""}`}
            >
              {[0, 1].map((copyIndex) => (
                <div
                  className="guest-album-sequence"
                  aria-hidden={copyIndex === 1}
                  key={`album-sequence-${rowIndex}-${copyIndex}`}
                >
                  {row.map((item, imageIndex) => (
                    <figure
                      className={`guest-album-photo guest-album-photo-${imageIndex % 3}`}
                      key={`album-photo-${rowIndex}-${copyIndex}-${imageIndex}`}
                    >
                      <img src={item.image} alt={item.alt} loading="lazy" />
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

