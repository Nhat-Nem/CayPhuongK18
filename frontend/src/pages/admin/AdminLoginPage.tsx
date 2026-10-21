import { useState, type FormEvent } from "react"
import logoImg from "@/imports/logo.png"
import { routes } from "@/config/routes"
import {
  demoAdminAccount,
  demoStaffAccount,
  getAuthenticatedUser,
  isAdminAuthenticated,
  loginAdmin,
} from "@/utils/adminAuth"

interface AdminLoginPageProps {
  redirectTo?: string
}

export default function AdminLoginPage({
  redirectTo,
}: AdminLoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.")
      return
    }

    try {
      const user = await loginAdmin(username, password)

      if (user.role === "STAFF") {
        window.location.assign(routes.adminOrders)
        return
      }

      const safeRedirect =
        redirectTo &&
        redirectTo !== routes.adminLogin &&
        (redirectTo === routes.admin || redirectTo.startsWith("/admin/"))
          ? redirectTo
          : routes.adminRooms

      window.location.assign(safeRedirect)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tên đăng nhập hoặc mật khẩu không đúng.",
      )
    }
  }

  const alreadyLoggedIn = isAdminAuthenticated()
  const currentUser = getAuthenticatedUser()
  const currentPortal =
    currentUser?.role === "STAFF" ? routes.adminOrders : routes.adminRooms

  return (
    <main className="admin-login-page">
      <section className="admin-login-visual" aria-label="Cây Phượng K18">
        <a className="admin-login-brand" href={routes.home}>
          <img src={logoImg} alt="Cây Phượng K18" />
          <div>
            <strong>Cây Phượng K18</strong>
            <span>Homestay & Nhà hàng</span>
          </div>
        </a>

        <div className="admin-login-visual-copy">
          <p>HỆ THỐNG QUẢN LÝ</p>
          <h1>Quản lý Cây Phượng K18</h1>
          <span>
            Admin quản trị hệ thống. Nhân viên sử dụng khu vực đơn hàng để
            ghi nhận và điều chỉnh món khách yêu cầu.
          </span>
        </div>
      </section>

      <section className="admin-login-panel">
        <div className="admin-login-card">
          <a className="admin-login-back" href={routes.home}>
            ← Quay lại website
          </a>

          <p className="admin-login-eyebrow">ADMIN & STAFF PORTAL</p>
          <h2>Đăng nhập hệ thống</h2>
          <p className="admin-login-intro">
            Sử dụng tài khoản Admin hoặc Nhân viên để truy cập đúng khu vực
            được phân quyền.
          </p>

          {alreadyLoggedIn && (
            <div className="admin-login-success">
              Bạn đang đăng nhập với quyền {currentUser?.role || "quản lý"}.{" "}
              <a href={currentPortal}>Vào hệ thống →</a>
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label>
              <span>Tên đăng nhập</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
              />
            </label>

            <label>
              <span>Mật khẩu</span>
              <div className="admin-login-password">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </label>

            {error && <p className="admin-login-error">{error}</p>}

            <button className="admin-login-submit" type="submit">
              Đăng nhập
              <span>→</span>
            </button>
          </form>

          <div className="admin-login-demo-grid">
            <div className="admin-login-demo">
              <strong>Tài khoản Admin</strong>
              <span>
                Tên đăng nhập: <code>{demoAdminAccount.username}</code>
              </span>
              <span>
                Mật khẩu: <code>{demoAdminAccount.password}</code>
              </span>
              <small>Quản trị toàn bộ khu vực quản lý.</small>
            </div>

            <div className="admin-login-demo admin-login-demo--staff">
              <strong>Tài khoản Nhân viên</strong>
              <span>
                Tên đăng nhập: <code>{demoStaffAccount.username}</code>
              </span>
              <span>
                Mật khẩu: <code>{demoStaffAccount.password}</code>
              </span>
              <small>Truy cập chức năng Quản lý Order của Sprint 5.</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
