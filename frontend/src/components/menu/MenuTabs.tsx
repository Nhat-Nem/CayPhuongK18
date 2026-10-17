import { useEffect, useMemo, useState } from "react"
import DishCard from "@/components/menu/DishCard"
import {
  getMenuCategories,
  getMenuDishes,
  MENU_UPDATED_EVENT,
  type MenuCategory,
  type MenuDish,
} from "@/services/menuStore"

export default function MenuTabs() {
  const [tab, setTab] = useState("all")
  const [allDishes, setAllDishes] = useState<MenuDish[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refresh = async () => {
    setLoading(true)
    setError("")

    try {
      const [dishes, categoryRows] = await Promise.all([
        getMenuDishes(),
        getMenuCategories(),
      ])
      setAllDishes(dishes)
      setCategories(categoryRows)

      if (tab !== "all" && !categoryRows.some((category) => category.id === tab)) {
        setTab("all")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải thực đơn.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    const handleUpdate = () => void refresh()
    window.addEventListener(MENU_UPDATED_EVENT, handleUpdate)
    return () => window.removeEventListener(MENU_UPDATED_EVENT, handleUpdate)
  }, [])

  const visibleDishes = useMemo(
    () =>
      tab === "all"
        ? allDishes
        : allDishes.filter((dish) => dish.categoryId === tab),
    [allDishes, tab],
  )

  const tabs = [
    { id: "all", name: "Tất cả" },
    ...categories.map((category) => ({ id: category.id, name: category.name })),
  ]

  return (
    <div className="menu-catalog">
      <aside className="menu-catalog-nav">
        <p className="eyebrow">DANH MỤC THỰC ĐƠN</p>
        <h3>Hôm nay bạn muốn thưởng thức gì?</h3>

        <div className="tabs menu-tabs" aria-label="Danh mục món ăn">
          {tabs.map((category, index) => {
            const count =
              category.id === "all"
                ? allDishes.length
                : allDishes.filter((dish) => dish.categoryId === category.id).length

            return (
              <button
                className={tab === category.id ? "active" : ""}
                onClick={() => setTab(category.id)}
                aria-pressed={tab === category.id}
                key={category.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{category.name}</strong>
                <small>{count} món</small>
              </button>
            )
          })}
        </div>

        <div className="menu-reservation-note">
          <span className="script">Bữa ngon</span>
          <p>Đặt bàn trước để chúng tôi chuẩn bị không gian và món ăn chu đáo nhất.</p>
          <a href="/lien-he?type=table">Đặt bàn ngay <span>→</span></a>
        </div>
      </aside>

      <div className="menu-catalog-main">
        {error && <div className="career-data-notice error">{error}</div>}

        {loading ? (
          <div className="career-data-notice">Đang tải thực đơn...</div>
        ) : (
          <>
            <div className="menu-catalog-summary">
              <div>
                <span>{String(visibleDishes.length).padStart(2, "0")}</span>
                <p>lựa chọn trong danh mục</p>
              </div>
              <p>Mỗi món được chế biến khi khách gọi để giữ trọn độ tươi ngon và hương vị.</p>
            </div>

            <div className="dish-grid">
              {visibleDishes.map((dish, index) => (
                <DishCard dish={dish} featured={tab === "all" && index === 0} key={dish.id} />
              ))}
            </div>

            {visibleDishes.length === 0 && (
              <div className="career-data-notice">Danh mục này hiện chưa có món ăn.</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
