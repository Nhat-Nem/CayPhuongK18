import { useState } from "react"
import { A } from "@/config/assets"
import { offers } from "@/data/offers"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"

export default function OffersPage() {
  const [category, setCategory] = useState("Tất cả")
  const filteredOffers =
    category === "Tất cả"
      ? offers
      : offers.filter((offer) => offer.category === category)
  return (
    <Shell>
      <Hero
        image="dd726.png"
        title="ƯU ĐÃI"
        subtitle="Từ các gói nghỉ dưỡng thư giãn, ẩm thực đặc sắc đến những hành trình khám phá thiên nhiên và văn hóa độc đáo."
      />
      <section className="section sage offers-section">
        <div className="offers-heading">
          <div>
            <p className="eyebrow">ƯU ĐÃI DÀNH RIÊNG CHO BẠN</p>
            <h2>
              Thêm trải nghiệm,
              <br />
              thêm nhiều niềm vui
            </h2>
          </div>
          <p>
            Khám phá các chương trình dành cho kỳ nghỉ, gia đình và ẩm thực. Mỗi
            ưu đãi đều được thiết kế để hành trình tại Cây Phượng K18 thêm trọn
            vẹn.
          </p>
        </div>
        <div className="offer-filters" aria-label="Lọc ưu đãi">
          {["Tất cả", "Lưu trú", "Ẩm thực"].map((item) => (
            <button
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="offers-showcase">
          {filteredOffers.map((offer, index) => (
            <article
              className={`offer-card ${
                category === "Tất cả" && index === 0 ? "offer-featured" : ""
              }`}
              key={offer.title}
            >
              <div className="offer-card-image">
                <img src={`${A}${offer.image}`} alt="" />
                <span>{offer.category}</span>
              </div>
              <div className="offer-card-content">
                <p className="offer-date">{offer.date}</p>
                <h3>{offer.title}</h3>
                <p>{offer.text}</p>
                <a href="/uu-dai/chi-tiet">
                  Xem chi tiết ưu đãi <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  )
}

