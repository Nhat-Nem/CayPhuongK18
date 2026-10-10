const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const ADMIN_TOKEN_KEY = 'cay-phuong-admin-token'

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = `API error ${response.status}`
    try {
      const data = await response.json() as { message?: string | string[]; error?: string }
      if (Array.isArray(data.message)) message = data.message.join(', ')
      else if (data.message) message = data.message
      else if (data.error) message = data.error
    } catch {
      // Keep fallback message.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
