import type { Dish } from "@/data/dishes"
import type { MenuDish } from "@/services/menuStore"

export default function DishCard({
  dish,
  featured = false,
  compact = false,
}: {
  dish: Dish | MenuDish
  featured?: boolean
  compact?: boolean
}) {
  /*
   * HomePage vẫn dùng dữ liệu món tĩnh từ data/dishes.ts nên các món đó
   * không có id backend.
   *
   * Không được gọi getMenuDishes().find(...) ở đây vì getMenuDishes()
   * là async và trả Promise. Gọi .find trên Promise làm React crash và
   * toàn bộ trang localhost:5173 trắng.
   */
  const hasBackendId = "id" in dish && Boolean(dish.id)

  const href = hasBackendId
    ? `/menu/chi-tiet?dish=${encodeURIComponent(String(dish.id))}`
    : "/menu"

  return (
    <a
      className={`dish-card ${featured ? "featured-dish" : ""} ${
        compact ? "compact-dish" : ""
      }`}
      href={href}
    >
      <div className="dish-image">
        <img src={dish.image} alt={dish.name} />
        {featured && <span className="dish-badge">Món được yêu thích</span>}
      </div>

      <div className="dish-card-content">
        <p className="dish-category">{dish.category}</p>
        <h3>{dish.name}</h3>

        <p className="dish-summary">
          {dish.description ||
            "Được chế biến từ nguyên liệu tươi ngon, giữ trọn hương vị gần gũi và đậm đà bản sắc địa phương."}
        </p>

        <div className="dish-card-footer">
          <strong>{dish.price}</strong>
          <span>
            Xem món <i>→</i>
          </span>
        </div>
      </div>
    </a>
  )
}
