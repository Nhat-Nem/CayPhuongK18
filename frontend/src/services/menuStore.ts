import { apiRequest } from "./api"

export type MenuGroup = "Món ăn" | "Tráng miệng"

export type MenuCategory = {
  id: string
  name: string
  description: string
}

export type MenuDish = {
  id: string
  image: string
  name: string
  price: string
  priceValue: number
  group: MenuGroup
  category: string
  categoryId: string
  description: string
  ingredient: string
  custom: true
}

export type CreateMenuDishPayload = {
  name: string
  price: number
  categoryId: number
  description?: string
  ingredient?: string
  image?: string
}

type BackendCategory = {
  id: string | number
  name: string
  description?: string | null
}

type BackendMenuItem = {
  id: string | number
  name: string
  description?: string | null
  price: string | number
  ingredient?: string | null
  image?: string | null
  sold?: number
  categoryId: string | number
  category?: BackendCategory | null
  createdAt?: string
  updatedAt?: string
}

export const MENU_UPDATED_EVENT = "cay-phuong-menu-updated"
export const MENU_ITEMS_API_PATH = "/api/v1/menu-items"
export const CATEGORY_API_PATH = "/api/v1/category"

function formatPrice(value: string | number) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return String(value)
  return `${new Intl.NumberFormat("vi-VN").format(amount)} VNĐ`
}

function resolveGroup(categoryName: string): MenuGroup {
  return categoryName.toLocaleLowerCase("vi").includes("tráng miệng")
    ? "Tráng miệng"
    : "Món ăn"
}

function normalizeCategory(row: BackendCategory): MenuCategory {
  return {
    id: String(row.id),
    name: String(row.name ?? "").trim(),
    description: String(row.description ?? "").trim(),
  }
}

function normalizeMenuItem(row: BackendMenuItem): MenuDish {
  const categoryName = String(row.category?.name ?? "Chưa phân loại").trim()
  const amount = Number(row.price)

  return {
    id: String(row.id),
    image: String(row.image ?? "").trim() || "/assets/122ab.png",
    name: String(row.name ?? "").trim(),
    price: formatPrice(row.price),
    priceValue: Number.isFinite(amount) ? amount : 0,
    group: resolveGroup(categoryName),
    category: categoryName,
    categoryId: String(row.category?.id ?? row.categoryId ?? ""),
    description: String(row.description ?? "").trim(),
    ingredient: String(row.ingredient ?? "").trim(),
    custom: true,
  }
}

function emitMenuUpdated() {
  window.dispatchEvent(new Event(MENU_UPDATED_EVENT))
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const rows = await apiRequest<BackendCategory[]>(CATEGORY_API_PATH)
  return rows.map(normalizeCategory)
}

export async function createMenuCategory(payload: {
  name: string
  description?: string
}): Promise<MenuCategory> {
  const row = await apiRequest<BackendCategory>(CATEGORY_API_PATH, {
    method: "POST",
    body: JSON.stringify({
      name: payload.name.trim(),
      ...(payload.description?.trim()
        ? { description: payload.description.trim() }
        : {}),
    }),
  })

  emitMenuUpdated()
  return normalizeCategory(row)
}

export async function deleteMenuCategory(id: string): Promise<void> {
  await apiRequest<{ message?: string }>(
    `${CATEGORY_API_PATH}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )
  emitMenuUpdated()
}

export async function getMenuDishes(): Promise<MenuDish[]> {
  const rows = await apiRequest<BackendMenuItem[]>(MENU_ITEMS_API_PATH)
  return rows.map(normalizeMenuItem)
}

export async function getMenuDishById(
  id: string,
): Promise<MenuDish | undefined> {
  if (!id) return undefined

  const row = await apiRequest<BackendMenuItem>(
    `${MENU_ITEMS_API_PATH}/${encodeURIComponent(id)}`,
  )
  return normalizeMenuItem(row)
}

export async function addMenuDish(
  payload: CreateMenuDishPayload,
): Promise<MenuDish> {
  const row = await apiRequest<BackendMenuItem>(MENU_ITEMS_API_PATH, {
    method: "POST",
    body: JSON.stringify({
      name: payload.name.trim(),
      price: payload.price,
      categoryId: payload.categoryId,
      ...(payload.description?.trim()
        ? { description: payload.description.trim() }
        : {}),
      ...(payload.ingredient?.trim()
        ? { ingredient: payload.ingredient.trim() }
        : {}),
      ...(payload.image?.trim() ? { image: payload.image.trim() } : {}),
    }),
  })

  emitMenuUpdated()
  return normalizeMenuItem(row)
}

export async function updateMenuDish(
  id: string,
  payload: CreateMenuDishPayload,
): Promise<MenuDish> {
  const row = await apiRequest<BackendMenuItem>(
    `${MENU_ITEMS_API_PATH}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: payload.name.trim(),
        price: payload.price,
        categoryId: payload.categoryId,
        description: payload.description?.trim() || "",
        ingredient: payload.ingredient?.trim() || "",
        image: payload.image?.trim() || "",
      }),
    },
  )

  emitMenuUpdated()
  return normalizeMenuItem(row)
}

export async function deleteMenuDish(id: string): Promise<void> {
  await apiRequest<{ message?: string }>(
    `${MENU_ITEMS_API_PATH}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )
  emitMenuUpdated()
}
