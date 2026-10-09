const ADMIN_AUTH_KEY = "cay-phuong-admin-auth"

// Prototype Sprint 1: tài khoản mẫu dùng để trình diễn giao diện.
// Khi backend Auth/API hoàn thiện, thay loginAdmin() bằng lời gọi API.
const DEMO_ADMIN = {
  username: "admin",
  password: "Admin@123",
}

export function isAdminAuthenticated() {
  return window.localStorage.getItem(ADMIN_AUTH_KEY) === "authenticated"
}

export function loginAdmin(username: string, password: string) {
  const valid =
    username.trim().toLowerCase() === DEMO_ADMIN.username &&
    password === DEMO_ADMIN.password

  if (valid) {
    window.localStorage.setItem(ADMIN_AUTH_KEY, "authenticated")
  }

  return valid
}

export function logoutAdmin() {
  window.localStorage.removeItem(ADMIN_AUTH_KEY)
}

export const demoAdminAccount = {
  username: DEMO_ADMIN.username,
  password: DEMO_ADMIN.password,
}
