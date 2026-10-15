import { useEffect, useMemo, useState } from "react"
import DishCard from "@/components/menu/DishCard"
import { getMenuDishes, MENU_UPDATED_EVENT } from "@/services/menuStore"

export default function MenuTabs() {
  const [tab, setTab] = useState("Tất cả")
  const [allDishes, setAllDishes] = useState(() => getMenuDishes())

  useEffect(() => {
    const refresh = () => setAllDishes(getMenuDishes())
    window.addEventListener(MENU_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(MENU_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [])

  const visibleDishes = useMemo(
    () =>
      tab === "Tất cả"
        ? allDishes
        : allDishes.filter((dish) => dish.group === tab),
    [allDishes, tab],
  )
  const categories = ["Tất cả", "Món ăn", "Tráng miệng"]

  return (
    <div className="menu-catalog">
      <aside className="menu-catalog-nav">
        <p className="eyebrow">DANH MỤC THỰC ĐƠN</p>
        <h3>Hôm nay bạn muốn thưởng thức gì?</h3>
        <div className="tabs menu-tabs" aria-label="Danh mục món ăn">
          {categories.map((name, index) => {
            const count =
              name === "Tất cả"
                ? allDishes.length
                : allDishes.filter((dish) => dish.group === name).length
            return (
              <button
                className={tab === name ? "active" : ""}
                onClick={() => setTab(name)}
                aria-pressed={tab === name}
                key={name}
              >
                <span>0{index + 1}</span>
                <strong>{name}</strong>
                <small>{count} món</small>
              </button>
            )
          })}
        </div>
        <div className="menu-reservation-note">
          <span className="script">Bữa ngon</span>
          <p>
            Đặt bàn trước để chúng tôi chuẩn bị không gian và món ăn chu đáo
            nhất.
          </p>
          <a href="/lien-he?type=table">
            Đặt bàn ngay <span>→</span>
          </a>
        </div>
      </aside>
      <div className="menu-catalog-main">
        <div className="menu-catalog-summary">
          <div>
            <span>{String(visibleDishes.length).padStart(2, "0")}</span>
            <p>lựa chọn trong danh mục</p>
          </div>
          <p>
            Mỗi món được chế biến khi khách gọi để giữ trọn độ tươi ngon và
            hương vị.
          </p>
        </div>
        <div className="dish-grid">
          {visibleDishes.map((dish, index) => (
            <DishCard
              dish={dish}
              featured={tab === "Tất cả" && index === 0}
              key={dish.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
