import { useEffect } from "react"
import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import ButtonLink from "@/components/common/ButtonLink"
import OfferCards from "@/components/home/OfferCards"
import FoodAlbum from "@/components/home/FoodAlbum"
import ActivityAlbumMarquee from "@/components/home/ActivityAlbumMarquee"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import DishCard from "@/components/menu/DishCard"
import { dishes } from "@/data/dishes"

export default function HomePage() {
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
          <img src={`${A}122ab.png`} alt="Mâm ẩm thực tại Cây Phượng K18" />
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
          {dishes.slice(0, 6).map((dish) => (
            <DishCard dish={dish} compact key={dish.name} />
          ))}
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
        <div className="card-grid rooms-preview">
          {[
            ["fe9cf.png", "Phòng Deluxe Hướng Bể Bơi"],
            ["38fc5.png", "Phòng Glamping Deluxe"],
            ["7dcd9.png", "Phòng Deluxe Hướng Núi"],
          ].map(([image, title], index) => (
            <article className="card" key={title}>
              <img src={`${A}${image}`} alt="" />
              <div className="card-body">
                <h3>{title}</h3>
                <ButtonLink href="/phong/chi-tiet">Xem thêm</ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
      <FoodAlbum />
      <ActivityAlbumMarquee />
      <TestimonialsSection />
      <section id="tin-tuc" className="section pearl centered">
        <h2 className="home-title-reveal">BẢN ĐỒ DU LỊCH</h2>
        <img
          className="map-wide"
          src={`${A}16b53.png`}
          alt="Bản đồ du lịch khu vực"
        />
      </section>
    </Shell>
  )
}

