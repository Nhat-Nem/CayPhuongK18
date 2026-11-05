import { apiRequest } from "@/services/api"

const ADMIN_TOKEN_KEY = "cay-phuong-admin-token"
const ADMIN_USER_KEY = "cay-phuong-admin-user"

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
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY)
  if (!token) return false

  try {
    const payloadPart = token.split(".")[1]
    if (!payloadPart) return true

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    const paddedPayload = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")
    const payload = JSON.parse(atob(paddedPayload)) as { exp?: unknown }

    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      logoutAdmin()
      return false
    }
  } catch {
    // Let the API reject malformed or unverifiable tokens.
  }

  return true
}

function normalizePortalRole(value: unknown): PortalRole | null {
  const role = String(value ?? "").trim().toUpperCase()
  if (role === "ADMIN" || role === "STAFF") return role
  return null
}

export function getAuthenticatedUser(): AdminUser | null {
  const raw = window.localStorage.getItem(ADMIN_USER_KEY)
  if (!raw) return null

  try {
    const user = JSON.parse(raw) as Partial<AdminUser>
    const role = normalizePortalRole(user.role)
    if (!role || !user.email) return null
    return { ...user, role } as AdminUser
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

export async function loginAdmin(
  usernameOrEmail: string,
  password: string,
) {
  const result = await apiRequest<LoginResponse>("/api/v1/auth", {
    method: "POST",
    body: JSON.stringify({
      // The backend accepts either the account email or username.
      email: usernameOrEmail.trim(),
      password,
    }),
  })

  const normalizedRole = normalizePortalRole(result.user?.role)
  if (!normalizedRole) {
    throw new Error("Tài khoản chưa có quyền ADMIN hoặc STAFF trong backend.")
  }

  const user: AdminUser = {
    ...result.user,
    role: normalizedRole,
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
