import type { Dish } from "@/data/dishes"
import { getMenuDishes, type MenuDish } from "@/services/menuStore"

export default function DishCard({
  dish,
  featured = false,
  compact = false,
}: {
  dish: Dish | MenuDish
  featured?: boolean
  compact?: boolean
}) {
  const id = "id" in dish
    ? dish.id
    : getMenuDishes().find((item) => item.name === dish.name)?.id ?? ""

  return (
    <a
      className={`dish-card ${featured ? "featured-dish" : ""} ${compact ? "compact-dish" : ""}`}
      href={id ? `/menu/chi-tiet?dish=${encodeURIComponent(id)}` : "/menu/chi-tiet"}
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
