import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import {
  formatPromotionDate,
  getCustomerPromotions,
  getPromotionById,
  promotionApplyTypeLabel,
  promotionImage,
  type PromotionRecord,
} from "@/services/promotionStore"

export default function OfferDetailPage() {
  const id = new URLSearchParams(window.location.search).get("id")
  const [item, setItem] = useState<PromotionRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          setItem(await getPromotionById(id))
          return
        }

        const rows = await getCustomerPromotions()
        setItem(rows[0] ?? null)
      } catch {
        setItem(null)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) {
    return (
      <Shell>
        <Hero image="dd726.png" title="ƯU ĐÃI" subtitle="Đang tải chương trình ưu đãi..." />
      </Shell>
    )
  }

  if (!item) {
    return (
      <Shell>
        <Hero
          image="dd726.png"
          title="ƯU ĐÃI"
          subtitle="Chương trình ưu đãi bạn đang tìm hiện không có dữ liệu."
        />
        <section className="section sage offer-detail">
          <div className="offers-empty">
            <strong>Không tìm thấy chương trình ưu đãi.</strong>
            <a href="/uu-dai">← Quay lại danh sách ưu đãi</a>
          </div>
        </section>
      </Shell>
    )
  }

  const applyLabel = promotionApplyTypeLabel(item.applyType)

  return (
    <Shell>
      <Hero
        image={promotionImage(item.applyType)}
        title="ƯU ĐÃI"
        subtitle={`Chương trình giảm ${item.discountPercent}% dành cho ${applyLabel.toLocaleLowerCase("vi")} tại Cây Phượng K18.`}
      />
      <article className="section sage offer-detail">
        <nav className="dish-breadcrumb" aria-label="Đường dẫn">
          <a href="/uu-dai">Ưu đãi</a>
          <span>/</span>
          <strong>{item.name}</strong>
        </nav>

        <header className="offer-detail-header">
          <div>
            <p className="offer-date">
              {formatPromotionDate(item.startDate)} – {formatPromotionDate(item.endDate)}
            </p>
            <h2>{item.name}</h2>
            <p>
              Nhận mức giảm {item.discountPercent}% khi sử dụng dịch vụ {applyLabel.toLocaleLowerCase("vi")} trong thời gian chương trình.
            </p>
          </div>
          <a href="/lien-he">
            Nhận ưu đãi ngay <span>→</span>
          </a>
        </header>

        <div className="offer-detail-visual">
          <img src={`${A}${promotionImage(item.applyType)}`} alt="" />
          <div className="offer-highlight">
            <span>Mức ưu đãi</span>
            <strong>Giảm {item.discountPercent}%</strong>
            <p>Áp dụng cho: {applyLabel}.</p>
          </div>
        </div>

        <div className="offer-terms offer-dynamic-terms">
          <div>
            <p className="eyebrow">THÔNG TIN CHƯƠNG TRÌNH</p>
            <h2>Điều kiện áp dụng</h2>
            <ul>
              <li>Áp dụng từ {formatPromotionDate(item.startDate)} đến {formatPromotionDate(item.endDate)}.</li>
              <li>Hình thức áp dụng: {item.applyType} - {applyLabel}.</li>
              <li>Mức giảm giá: {item.discountPercent}%.</li>
              <li>Ưu đãi không quy đổi thành tiền mặt.</li>
            </ul>
            <a className="room-booking-link" href="/lien-he">
              Liên hệ để nhận ưu đãi <span>→</span>
            </a>
          </div>
        </div>
      </article>
    </Shell>
  )
}
