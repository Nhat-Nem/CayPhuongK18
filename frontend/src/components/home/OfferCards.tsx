import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import {
  getCustomerPromotions,
  promotionApplyTypeLabel,
  promotionImage,
  type PromotionRecord,
} from "@/services/promotionStore"

export default function OfferCards() {
  const [offers, setOffers] = useState<PromotionRecord[]>([])
  const [position, setPosition] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCustomerPromotions()
      .then((rows) => setOffers(rows.slice(0, 3)))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="offers-empty compact">
        <strong>Đang tải chương trình ưu đãi...</strong>
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="offers-empty compact">
        <strong>Chưa có chương trình ưu đãi đang mở.</strong>
      </div>
    )
  }

  const shown = [...offers.slice(position), ...offers.slice(0, position)]

  return (
    <div className="carousel">
      <button
        onClick={() => setPosition((position + offers.length - 1) % offers.length)}
        aria-label="Ưu đãi trước"
      >
        ←
      </button>
      <div className="card-grid offer-grid">
        {shown.map((offer) => (
          <article className="card" key={offer.id}>
            <img src={`${A}${promotionImage(offer.applyType)}`} alt="" />
            <div className="card-body">
              <small>{promotionApplyTypeLabel(offer.applyType)} · Giảm {offer.discountPercent}%</small>
              <h3>{offer.name}</h3>
              <p>
                Ưu đãi {offer.discountPercent}% dành cho {promotionApplyTypeLabel(offer.applyType).toLocaleLowerCase("vi")}.
              </p>
              <a href={`/uu-dai/chi-tiet?id=${encodeURIComponent(offer.id)}`}>
                Tìm hiểu thêm »
              </a>
            </div>
          </article>
        ))}
      </div>
      <button
        onClick={() => setPosition((position + 1) % offers.length)}
        aria-label="Ưu đãi tiếp theo"
      >
        →
      </button>
    </div>
  )
}
