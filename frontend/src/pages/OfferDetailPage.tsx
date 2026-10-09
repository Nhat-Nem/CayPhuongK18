import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"

export default function OfferDetailPage() {
  return (
    <Shell>
      <Hero
        image="dd726.png"
        title="ƯU ĐÃI"
        subtitle="Từ các gói nghỉ dưỡng thư giãn, ẩm thực đặc sắc đến những hành trình khám phá thiên nhiên và văn hóa độc đáo."
      />
      <article className="section sage offer-detail">
        <nav className="dish-breadcrumb" aria-label="Đường dẫn">
          <a href="/uu-dai">Ưu đãi</a>
          <span>/</span>
          <strong>Tặng bữa sáng cho khách lưu trú</strong>
        </nav>
        <header className="offer-detail-header">
          <div>
            <p className="offer-date">20/10/2025 – 30/09/2026</p>
            <h2>
              Tặng bữa sáng
              <br />
              cho khách lưu trú
            </h2>
            <p>
              Bắt đầu ngày mới đầy năng lượng với bữa sáng miễn phí dành cho
              khách lưu trú tại Cây Phượng K18.
            </p>
          </div>
          <a href="/lien-he">
            Nhận ưu đãi ngay <span>→</span>
          </a>
        </header>
        <div className="offer-detail-visual">
          <img src={`${A}e3d6c.png`} alt="Phở và món ăn sáng" />
          <div className="offer-highlight">
            <span>Quyền lợi nổi bật</span>
            <strong>Miễn phí bữa sáng</strong>
            <p>Áp dụng cho khách lưu trú theo điều kiện của chương trình.</p>
          </div>
        </div>
        <section className="offer-benefits">
          <div className="offer-benefit-intro">
            <p className="eyebrow">ƯU ĐÃI BAO GỒM</p>
            <h2>
              Một khởi đầu
              <br />
              trọn vẹn hơn
            </h2>
            <p>
              Không chỉ mang đến không gian nghỉ dưỡng thoải mái, chúng tôi còn
              chuẩn bị bữa sáng để bạn có thêm năng lượng cho một ngày khám phá.
            </p>
          </div>
          <div className="benefit-list">
            <div>
              <span>01</span>
              <h3>Bữa sáng miễn phí</h3>
              <p>Dành cho khách lưu trú theo điều kiện của chương trình.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Thực đơn đa dạng</h3>
              <p>Nhiều lựa chọn phù hợp cho cả người lớn và trẻ em.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Không gian thoải mái</h3>
              <p>Phù hợp cho cá nhân, cặp đôi và gia đình.</p>
            </div>
          </div>
        </section>
        <div className="offer-terms">
          <img src={`${A}63141.png`} alt="Bữa sáng tại Cây Phượng K18" />
          <div>
            <p className="eyebrow">ĐIỀU KIỆN ÁP DỤNG</p>
            <h2>Thông tin cần biết</h2>
            <ul>
              <li>Áp dụng trong thời gian diễn ra chương trình.</li>
              <li>Bữa sáng phục vụ trong khung giờ quy định của nhà hàng.</li>
              <li>Vui lòng kiểm tra thời gian phục vụ khi nhận phòng.</li>
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

