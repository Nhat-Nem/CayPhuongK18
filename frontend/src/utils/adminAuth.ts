import { apiRequest } from '@/services/api'

const ADMIN_TOKEN_KEY = 'cay-phuong-admin-token'
const ADMIN_USER_KEY = 'cay-phuong-admin-user'

export interface AdminUser {
  id: string
  username: string
  email: string
  full_name: string
  role: 'ADMIN'
}

interface LoginResponse {
  access_token: string
  user: AdminUser
}

export function isAdminAuthenticated() {
  return Boolean(window.localStorage.getItem(ADMIN_TOKEN_KEY))
}

export async function loginAdmin(usernameOrEmail: string, password: string) {
  const result = await apiRequest<LoginResponse>('/api/v1/auth', {
    method: 'POST',
    body: JSON.stringify({
      // Backend chấp nhận cả username và email trong field email để giữ tương thích DTO hiện tại.
      email: usernameOrEmail.trim(),
      password,
    }),
  })

  window.localStorage.setItem(ADMIN_TOKEN_KEY, result.access_token)
  window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(result.user))
  return result.user
}

export function logoutAdmin() {
  window.localStorage.removeItem(ADMIN_TOKEN_KEY)
  window.localStorage.removeItem(ADMIN_USER_KEY)
}

export const demoAdminAccount = {
  username: 'admin',
  password: 'Admin@123',
}
