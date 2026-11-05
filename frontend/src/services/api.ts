import { routes } from "@/config/routes"

const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "")

const ADMIN_TOKEN_KEY = "cay-phuong-admin-token"
const ADMIN_USER_KEY = "cay-phuong-admin-user"

let redirectingToLogin = false

function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  if (!RAW_API_BASE_URL) {
    return normalizedPath
  }

  // Chống cấu hình bị lặp:
  // base = http://localhost:8080/api/v1
  // path = /api/v1/auth
  // => http://localhost:8080/api/v1/auth
  if (
    /\/api\/v1$/i.test(RAW_API_BASE_URL) &&
    /^\/api\/v1(?:\/|$)/i.test(normalizedPath)
  ) {
    const hostOnly = RAW_API_BASE_URL.replace(/\/api\/v1$/i, "")
    return `${hostOnly}${normalizedPath}`
  }

  return `${RAW_API_BASE_URL}${normalizedPath}`
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY)
  const url = buildApiUrl(path)
  const method = (options?.method ?? "GET").toUpperCase()
  const isLoginRequest = method === "POST" && /\/auth\/?$/i.test(path)

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && !isLoginRequest ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = `API error ${response.status}`

    try {
      const data = (await response.json()) as {
        message?: string | string[]
        error?: string
      }

      if (Array.isArray(data.message)) {
        message = data.message.join(", ")
      } else if (data.message) {
        message = data.message
      } else if (data.error) {
        message = data.error
      }
    } catch {
      // Giữ thông báo mặc định nếu response không phải JSON.
    }

    if (response.status === 401 && !isLoginRequest) {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY)
      window.localStorage.removeItem(ADMIN_USER_KEY)

      const currentPath = window.location.pathname.replace(/\/+$/, "") || "/"
      const isAdminPage = currentPath === routes.admin || currentPath.startsWith(`${routes.admin}/`)

      if (isAdminPage && currentPath !== routes.adminLogin && !redirectingToLogin) {
        redirectingToLogin = true
        const redirectTo = `${window.location.pathname}${window.location.search}`
        const loginUrl = `${routes.adminLogin}?session=expired&redirect=${encodeURIComponent(redirectTo)}`
        window.location.replace(loginUrl)
      }
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
