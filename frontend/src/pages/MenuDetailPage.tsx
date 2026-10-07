import { A } from "@/config/assets"
import { dishes } from "@/data/dishes"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"

export default function MenuDetailPage() {
  return (
    <Shell>
      <Hero
        image="06f7b.png"
        title="ẨM THỰC"
        subtitle="Khám phá bản sắc ẩm thực Tây Ninh qua từng cung bậc hương vị, từ những món đặc sản nức tiếng đến khoảnh khắc quây quần thư thái giữa không gian xanh mát."
      />
      <section className="section sage menu-detail-section">
        <nav className="dish-breadcrumb" aria-label="Đường dẫn">
          <a href="/menu">Thực đơn</a>
          <span>/</span>
          <span>Món ăn</span>
          <span>/</span>
          <strong>Hamburger bò phô mai</strong>
        </nav>
        <article className="dish-detail-hero">
          <div className="dish-detail-media">
            <img
              className="dish-detail-main-image"
              src={`${A}1eb97.png`}
              alt="Hamburger bò phô mai"
            />
            <div className="dish-detail-thumbnails">
              <img src={`${A}1eb97.png`} alt="Hamburger nhìn từ phía trước" />
              <img src={`${A}f009a.png`} alt="Hamburger phô mai cận cảnh" />
            </div>
          </div>
          <div className="dish-detail-info">
            <p className="dish-detail-category">
              MÓN CHÍNH · ĐẶC SẢN ĐỊA PHƯƠNG
            </p>
            <h2>
              Hamburger
              <br />
              bò phô mai
            </h2>
            <p>
              Chiếc cheeseburger cổ điển nổi bật trên đĩa đen với lớp bánh mì
              mè, nhân bò áp chảo phủ phô mai Cheddar tan chảy, kết hợp cùng xà
              lách, cà chua và hành tây tươi mát.
            </p>
            <strong className="dish-detail-price">65.000 VNĐ</strong>
            <div className="dish-detail-facts">
              <div>
                <span>Khẩu phần</span>
                <strong>1 người</strong>
              </div>
              <div>
                <span>Thời gian</span>
                <strong>15–20 phút</strong>
              </div>
              <div>
                <span>Hương vị</span>
                <strong>Đậm đà</strong>
              </div>
            </div>
            <a className="dish-order-link" href="/lien-he">
              Liên hệ đặt món <span>→</span>
            </a>
          </div>
        </article>
        <section className="dish-ingredients">
          <div className="ingredient-copy">
            <p className="eyebrow">THÀNH PHẦN TƯƠI MỚI</p>
            <h2>
              Trọn vị trong từng
              <br />
              nguyên liệu
            </h2>
            <p>
              Mỗi phần ăn được chuẩn bị ngay khi khách gọi món để giữ độ nóng,
              độ giòn và hương vị tươi ngon nhất.
            </p>
            <ul>
              <li>Bánh mì tròn rắc hạt mè trắng</li>
              <li>Nhân thịt bò xay áp chảo</li>
              <li>Phô mai Cheddar</li>
              <li>Cà chua đỏ</li>
              <li>Hành tây trắng và rau xà lách xoăn.</li>
            </ul>
          </div>
          <div className="ingredient-image">
            <img src={`${A}f009a.png`} alt="Hamburger phô mai và rau tươi" />
            <span>Chế biến tươi mới mỗi ngày</span>
          </div>
        </section>
        <section className="related-dishes">
          <div className="related-heading">
            <div>
              <p className="eyebrow">GỢI Ý CHO BẠN</p>
              <h2>Khám phá thêm món ngon</h2>
            </div>
            <a href="/menu">
              Xem toàn bộ thực đơn <span>→</span>
            </a>
          </div>
          <div className="related-dish-grid">
            {dishes.slice(1, 4).map((dish) => (
              <a
                className="related-dish-card"
                href="/menu/chi-tiet"
                key={dish.name}
              >
                <img src={dish.image} alt={dish.name} />
                <div>
                  <h3>{dish.name}</h3>
                  <strong>{dish.price}</strong>
                </div>
              </a>
            ))}
          </div>
        </section>
      </section>
    </Shell>
  )
}

