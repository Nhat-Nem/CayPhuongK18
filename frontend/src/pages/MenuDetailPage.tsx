import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { getMenuDishById, getMenuDishes } from "@/services/menuStore"

export default function MenuDetailPage() {
  const id = new URLSearchParams(window.location.search).get("dish") ?? ""
  const allDishes = getMenuDishes()
  const dish = getMenuDishById(id) ?? allDishes[0]
  const related = allDishes.filter((item) => item.id !== dish?.id).slice(0, 3)

  if (!dish) {
    return (
      <Shell>
        <Hero image="06f7b.png" title="ẨM THỰC" />
        <section className="section centered">
          <h2>Không tìm thấy món ăn</h2>
          <a className="button-link" href="/menu">Quay lại thực đơn</a>
        </section>
      </Shell>
    )
  }

  return (
    <Shell>
      <Hero
        image="06f7b.png"
        title="ẨM THỰC"
        subtitle="Khám phá bản sắc ẩm thực Tây Ninh qua từng cung bậc hương vị, từ những món đặc sản nức tiếng đến khoảnh khắc quây quần thư thái giữa không gian xanh mát."
      />
      <section className="section sage menu-detail-section">
        <nav className="dish-breadcrumb" aria-label="Đường dẫn">
          <a href="/menu">Thực đơn</a><span>/</span><span>{dish.group}</span><span>/</span><strong>{dish.name}</strong>
        </nav>

        <article className="dish-detail-hero">
          <div className="dish-detail-media">
            <img className="dish-detail-main-image" src={dish.image} alt={dish.name} />
            <div className="dish-detail-thumbnails">
              <img src={dish.image} alt={dish.name} />
            </div>
          </div>
          <div className="dish-detail-info">
            <p className="dish-detail-category">{dish.group.toUpperCase()} · {dish.category.toUpperCase()}</p>
            <h2>{dish.name}</h2>
            <p>{dish.description || "Món ăn được chuẩn bị từ nguyên liệu tươi mới và phục vụ ngay khi khách gọi món."}</p>
            <strong className="dish-detail-price">{dish.price}</strong>
            <div className="dish-detail-facts">
              <div><span>Danh mục</span><strong>{dish.category}</strong></div>
              <div><span>Nhóm</span><strong>{dish.group}</strong></div>
              <div><span>Phục vụ</span><strong>Mỗi ngày</strong></div>
            </div>
            <a className="dish-order-link" href="/lien-he?type=table">Liên hệ đặt món <span>→</span></a>
          </div>
        </article>

        <section className="dish-ingredients">
          <div className="ingredient-copy">
            <p className="eyebrow">CHẾ BIẾN TƯƠI MỚI</p>
            <h2>Trọn vị trong từng món ăn</h2>
            <p>Mỗi phần ăn được chuẩn bị khi khách gọi để giữ độ nóng, hương vị và chất lượng tốt nhất.</p>
          </div>
          <div className="ingredient-image">
            <img src={dish.image} alt={dish.name} />
            <span>Chế biến tươi mới mỗi ngày</span>
          </div>
        </section>

        {related.length > 0 && (
          <section className="related-dishes">
            <div className="related-heading">
              <div><p className="eyebrow">GỢI Ý CHO BẠN</p><h2>Khám phá thêm món ngon</h2></div>
              <a href="/menu">Xem toàn bộ thực đơn <span>→</span></a>
            </div>
            <div className="related-dish-grid">
              {related.map((item) => (
                <a className="related-dish-card" href={`/menu/chi-tiet?dish=${encodeURIComponent(item.id)}`} key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div><h3>{item.name}</h3><strong>{item.price}</strong></div>
                </a>
              ))}
            </div>
          </section>
        )}
      </section>
    </Shell>
  )
}
