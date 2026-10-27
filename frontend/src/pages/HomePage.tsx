import { useEffect, useState } from "react"
import { A, resolveImageSource } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import ButtonLink from "@/components/common/ButtonLink"
import OfferCards from "@/components/home/OfferCards"
import FoodAlbum from "@/components/home/FoodAlbum"
import ActivityAlbumMarquee from "@/components/home/ActivityAlbumMarquee"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import DishCard from "@/components/menu/DishCard"
import { getMenuDishes, type MenuDish } from "@/services/menuStore"
import { getPublicRooms } from "@/services/roomApi"
import { isDatabaseImageSource } from "@/services/siteMediaApi"
import { formatRoomPrice, type RoomPrototype } from "@/data/roomPrototype"

export default function HomePage() {
  const [homeDishes, setHomeDishes] = useState<MenuDish[]>([])
  const [homeRooms, setHomeRooms] = useState<RoomPrototype[]>([])
  const [homeDataLoading, setHomeDataLoading] = useState(true)
  const dishesWithDatabaseImages = homeDishes.filter((dish) => isDatabaseImageSource(dish.image))
  const featuredDish = dishesWithDatabaseImages[0]

  useEffect(() => {
    let active = true
    Promise.allSettled([getMenuDishes(), getPublicRooms()] as const)
      .then(([menuResult, roomResult]) => {
        if (!active) return
        setHomeDishes(menuResult.status === "fulfilled" ? menuResult.value : [])
        setHomeRooms(roomResult.status === "fulfilled" ? roomResult.value : [])
      })
      .finally(() => {
        if (active) setHomeDataLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const titles = document.querySelectorAll<HTMLElement>(".home-title-reveal")
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (reduceMotion || !("IntersectionObserver" in window)) {
      titles.forEach((title) => title.classList.add("is-visible"))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    )

    titles.forEach((title) => observer.observe(title))
    return () => observer.disconnect()
  }, [])

  return (
    <Shell>
      <Hero
        image="06f7b.png"
        title="CÂY PHƯỢNG K18"
        subtitle="Điểm hẹn ẩm thực đậm vị Tây Ninh — nơi những bữa ăn ngon là trải nghiệm chính, bên cạnh không gian Homestay bình yên dành cho khách muốn nghỉ lại."
      />
      <section className="vietnamese-about">
        <div className="vietnamese-about-copy">
          <p className="eyebrow">NHÀ HÀNG CÂY PHƯỢNG K18</p>
          <h2 className="home-title-reveal">CÂY PHƯỢNG K18</h2>
          <p>
            Cây Phượng K18 trước hết là một quán ăn dành cho những bữa cơm ngon,
            những cuộc gặp gỡ ấm cúng và hành trình khám phá hương vị Tây Ninh.
            Thực đơn được chăm chút từ nguyên liệu tươi mới, cách nấu gần gũi và
            tinh thần hiếu khách chân thành.
          </p>
          <p>
            Bên cạnh nhà hàng là một khu Homestay nhỏ giữa không gian xanh, như
            một trải nghiệm bổ trợ dành cho thực khách muốn thong thả nghỉ lại
            sau bữa ăn và tận hưởng trọn vẹn nhịp sống yên bình nơi đây.
          </p>
          <a className="vietnamese-about-button" href="/ve-chung-toi">
            Khám phá thêm <span>→</span>
          </a>
        </div>
        <div className="vietnamese-about-image">
          <img src={featuredDish?.image ? resolveImageSource(featuredDish.image) : `${A}122ab.png`} alt={featuredDish?.name || "Mâm ẩm thực tại Cây Phượng K18"} />
          <span>Hương vị Tây Ninh</span>
        </div>
      </section>
      <section className="section bestseller-section">
        <div className="bestseller-heading home-title-reveal">
          <p className="eyebrow">MÓN ĂN ĐƯỢC YÊU THÍCH</p>
          <h2>Những món nhất định phải thử</h2>
          <p>
            Được nhiều thực khách lựa chọn, mỗi món là một hương vị đặc trưng
            của Cây Phượng K18.
          </p>
        </div>
        <div className="bestseller-grid">
          {homeDataLoading ? (
            <p className="career-data-notice">Đang tải món ăn từ cơ sở dữ liệu...</p>
          ) : dishesWithDatabaseImages.length > 0 ? dishesWithDatabaseImages.slice(0, 6).map((dish) => (
            <DishCard dish={dish} compact key={dish.id} />
          )) : (
            <p className="career-data-notice">Chưa có món ăn kèm ảnh trong cơ sở dữ liệu.</p>
          )}
        </div>
        <div className="bestseller-action">
          <ButtonLink href="/menu">Xem toàn bộ thực đơn</ButtonLink>
        </div>
      </section>
      <section className="section white centered">
        <div className="home-section-heading home-title-reveal">
          <div>
            <p className="eyebrow">ƯU ĐÃI</p>
            <h2>Ưu đãi dành riêng cho bạn</h2>
          </div>
          <p>
            Thưởng thức bữa ăn trọn vẹn hơn với các chương trình dành cho gia
            đình, nhóm bạn và thực khách kết hợp nghỉ lại tại Homestay.
          </p>
        </div>
        <OfferCards />
      </section>
      <section className="section olive centered">
        <div className="home-section-heading home-title-reveal">
          <div>
            <p className="eyebrow">LƯU TRÚ KẾT HỢP</p>
            <h2>Nghỉ lại giữa không gian xanh</h2>
          </div>
          <p>
            Một lựa chọn bổ trợ cho thực khách muốn kéo dài cuộc vui, với những
            căn phòng gỗ ấm cúng và gần gũi thiên nhiên.
          </p>
        </div>
        {homeDataLoading ? (
          <p className="career-data-notice">Đang tải phòng từ cơ sở dữ liệu...</p>
        ) : homeRooms.length > 0 ? (
          <div className="card-grid rooms-preview">
            {homeRooms.slice(0, 3).map((room) => (
              <article className="card" key={room.id}>
                {room.images.find((image) => isDatabaseImageSource(image)) && (
                  <img
                    src={resolveImageSource(room.images.find((image) => isDatabaseImageSource(image))!)}
                    alt={room.name}
                    loading="lazy"
                  />
                )}
                <div className="card-body">
                  <h3>{room.name}</h3>
                  <p>{formatRoomPrice(room.price)} / đêm</p>
                  <ButtonLink href={`/phong/chi-tiet?id=${encodeURIComponent(String(room.id))}`}>Xem thêm</ButtonLink>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="career-data-notice">Chưa có phòng đang hoạt động trong cơ sở dữ liệu.</p>
        )}
      </section>
      <FoodAlbum />
      <ActivityAlbumMarquee />
      <TestimonialsSection />
      <section id="dia-diem-du-lich" className="section pearl centered">
        <div className="home-section-heading home-title-reveal">
          <div>
            <p className="eyebrow">US.23 · KHÁM PHÁ ĐỊA PHƯƠNG</p>
            <h2>ĐỊA ĐIỂM DU LỊCH TÂY NINH</h2>
          </div>
          <p>
            Tham khảo các điểm đến nổi bật để kết hợp hành trình ăn uống, nghỉ
            ngơi và khám phá địa phương thuận tiện hơn.
          </p>
        </div>
        <img
          className="map-wide"
          src={`${A}16b53.png`}
          alt="Bản đồ du lịch khu vực"
        />
      </section>
    </Shell>
  )
}

