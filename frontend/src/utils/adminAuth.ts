import { apiRequest } from "@/services/api"

const ADMIN_TOKEN_KEY = "cay-phuong-admin-token"
const ADMIN_USER_KEY = "cay-phuong-admin-user"

const DEMO_ADMIN = {
  username: "admin",
  email:
    (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim() ||
    "admin@cayphuong.local",
  password: "Admin@123",
}

const DEMO_STAFF = {
  username: "staff",
  email:
    (import.meta.env.VITE_STAFF_EMAIL as string | undefined)?.trim() ||
    "staff@cayphuong.local",
  password: "Staff@123",
}

export type PortalRole = "ADMIN" | "STAFF"

export interface AdminUser {
  id: string
  username?: string
  email: string
  full_name: string
  role: PortalRole
}

interface LoginResponse {
  access_token: string
  user: AdminUser
}

export function isAdminAuthenticated() {
  return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY))
}

export function getAuthenticatedUser(): AdminUser | null {
  const raw = window.localStorage.getItem(ADMIN_USER_KEY)
  if (!raw) return null

  try {
    const user = JSON.parse(raw) as AdminUser
    if (user.role !== "ADMIN" && user.role !== "STAFF") return null
    return user
  } catch {
    return null
  }
}

export function isStaffAuthenticated() {
  return getAuthenticatedUser()?.role === "STAFF"
}

export function isAdminRole() {
  return getAuthenticatedUser()?.role === "ADMIN"
}

function resolveBackendLoginEmail(usernameOrEmail: string) {
  const value = usernameOrEmail.trim()
  const normalized = value.toLowerCase()

  if (normalized === DEMO_ADMIN.username) {
    return DEMO_ADMIN.email
  }

  if (normalized === DEMO_STAFF.username) {
    return DEMO_STAFF.email
  }

  return value
}

export async function loginAdmin(
  usernameOrEmail: string,
  password: string,
) {
  const loginEmail = resolveBackendLoginEmail(usernameOrEmail)

  const result = await apiRequest<LoginResponse>("/api/v1/auth", {
    method: "POST",
    body: JSON.stringify({
      email: loginEmail,
      password,
    }),
  })

  const user: AdminUser = {
    ...result.user,
    username:
      result.user.username ||
      (usernameOrEmail.includes("@")
        ? result.user.email
        : usernameOrEmail.trim()),
  }

  window.localStorage.setItem(ADMIN_TOKEN_KEY, result.access_token)
  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))

  return user
}

export function logoutAdmin() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY)
  window.localStorage.removeItem(ADMIN_USER_KEY)
}

export const demoAdminAccount = {
  username: DEMO_ADMIN.username,
  email: DEMO_ADMIN.email,
  password: DEMO_ADMIN.password,
}

export const demoStaffAccount = {
  username: DEMO_STAFF.username,
  email: DEMO_STAFF.email,
  password: DEMO_STAFF.password,
}
