import { useEffect, useMemo, useState } from "react"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import {
  formatPromotionDate,
  getCustomerPromotions,
  promotionApplyTypeLabel,
  type PromotionRecord,
} from "@/services/promotionStore"

export default function OffersPage() {
  const [category, setCategory] = useState("Tất cả")
  const [promotions, setPromotions] = useState<PromotionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerPromotions()
      .then(setPromotions)
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredOffers = useMemo(
    () =>
      promotions.filter((promotion) => {
        if (category === "Tất cả") return true
        if (category === "Khách sạn") return promotion.applyType === 1
        return promotion.applyType === 2
      }),
    [category, promotions],
  )

  return (
    <Shell>
      <Hero
        image="dd726.png"
        title="ƯU ĐÃI"
        subtitle="Khám phá các chương trình giảm giá dành cho dịch vụ lưu trú và nhà hàng tại Cây Phượng K18."
      />
      <section className="section sage offers-section">
        <div className="offers-heading">
          <div>
            <p className="eyebrow">CHƯƠNG TRÌNH ƯU ĐÃI</p>
            <h2>
              Thêm trải nghiệm,
              <br />
              thêm nhiều niềm vui
            </h2>
          </div>
          <p>
            Theo dõi mức giảm, thời gian áp dụng và dịch vụ được hưởng ưu đãi để
            lựa chọn chương trình phù hợp với chuyến đi của bạn.
          </p>
        </div>

        <div className="offer-filters" aria-label="Lọc ưu đãi">
          {["Tất cả", "Khách sạn", "Nhà hàng"].map((item) => (
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

        {loading ? (
          <div className="offers-empty">
            <strong>Đang tải chương trình ưu đãi...</strong>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="offers-showcase">
            {filteredOffers.map((offer, index) => (
              <article
                className={`offer-card ${category === "Tất cả" && index === 0 ? "offer-featured" : ""}`}
                key={offer.id}
              >
                <div className="offer-card-image">
                  <div className="offer-image-placeholder" aria-hidden="true" />
                  <span>{promotionApplyTypeLabel(offer.applyType)}</span>
                  <strong className="offer-discount-badge">-{offer.discountPercent}%</strong>
                </div>
                <div className="offer-card-content">
                  <p className="offer-date">
                    {formatPromotionDate(offer.startDate)} – {formatPromotionDate(offer.endDate)}
                  </p>
                  <h3>{offer.name}</h3>
                  <p>
                    Giảm {offer.discountPercent}% cho dịch vụ {promotionApplyTypeLabel(offer.applyType).toLocaleLowerCase("vi")} trong thời gian chương trình.
                  </p>
                  <a href={`/uu-dai/chi-tiet?id=${encodeURIComponent(offer.id)}`}>
                    Xem chi tiết ưu đãi <span>→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="offers-empty">
            <strong>Chưa có chương trình phù hợp</strong>
            <span>Vui lòng quay lại sau để xem các ưu đãi mới.</span>
          </div>
        )}
      </section>
    </Shell>
  )
}
