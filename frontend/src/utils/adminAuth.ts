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

export interface AdminUser {
  id: string
  username?: string
  email: string
  full_name: string
  role: "ADMIN"
}

interface LoginResponse {
  access_token: string
  user: {
    id: string
    username?: string
    email: string
    full_name: string
    role: "ADMIN"
  }
}

export function isAdminAuthenticated() {
  return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY))
}

function resolveBackendLoginEmail(usernameOrEmail: string) {
  const value = usernameOrEmail.trim()

  // Backend Auth hiện tìm User theo field email.
  // Giao diện vẫn cho phép nhập tài khoản demo "admin", nên map nó
  // sang email seed tương ứng trước khi POST /api/v1/auth.
  if (value.toLowerCase() === DEMO_ADMIN.username) {
    return DEMO_ADMIN.email
  }

  // Nếu người dùng nhập email trực tiếp thì gửi nguyên giá trị.
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
