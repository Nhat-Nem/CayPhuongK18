const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "")

const ADMIN_TOKEN_KEY = "cay-phuong-admin-token"

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

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
