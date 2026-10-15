import { dishes, type Dish } from "@/data/dishes"

export type MenuDish = Dish & {
  id: string
  custom?: boolean
}

export type CreateMenuDishPayload = Omit<MenuDish, "id" | "custom">

const CUSTOM_MENU_KEY = "cay-phuong-custom-menu-v1"
export const MENU_UPDATED_EVENT = "cay-phuong-menu-updated"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function builtInDishes(): MenuDish[] {
  return dishes.map((dish, index) => ({
    ...dish,
    id: `menu-${String(index + 1).padStart(2, "0")}-${slugify(dish.name)}`,
    custom: false,
  }))
}

function readCustomDishes(): MenuDish[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_MENU_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as MenuDish[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item) => item && item.name)
      .map((item) => ({
        id: String(item.id),
        image: String(item.image || "/assets/122ab.png"),
        name: String(item.name),
        price: String(item.price),
        group: item.group === "Tráng miệng" ? "Tráng miệng" : "Món ăn",
        category: String(item.category || "Món ăn"),
        description: String(item.description || ""),
        custom: true,
      }))
  } catch {
    return []
  }
}

function writeCustomDishes(items: MenuDish[]) {
  window.localStorage.setItem(CUSTOM_MENU_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(MENU_UPDATED_EVENT))
}

export function getMenuDishes(): MenuDish[] {
  return [...builtInDishes(), ...readCustomDishes()]
}

export function getMenuDishById(id: string): MenuDish | undefined {
  return getMenuDishes().find((item) => item.id === id)
}

export function addMenuDish(payload: CreateMenuDishPayload): MenuDish {
  const custom = readCustomDishes()
  const item: MenuDish = {
    ...payload,
    id: `custom-${Date.now()}-${slugify(payload.name) || "mon"}`,
    custom: true,
  }
  writeCustomDishes([...custom, item])
  return item
}

export function updateMenuDish(
  id: string,
  payload: CreateMenuDishPayload,
): MenuDish {
  const custom = readCustomDishes()
  const index = custom.findIndex((item) => item.id === id)
  if (index < 0) throw new Error("Chỉ có thể sửa món được thêm từ giao diện quản trị.")

  const item: MenuDish = { ...payload, id, custom: true }
  custom[index] = item
  writeCustomDishes(custom)
  return item
}

export function deleteMenuDish(id: string) {
  const custom = readCustomDishes()
  const next = custom.filter((item) => item.id !== id)
  if (next.length === custom.length) {
    throw new Error("Chỉ có thể xóa món được thêm từ giao diện quản trị.")
  }
  writeCustomDishes(next)
}
