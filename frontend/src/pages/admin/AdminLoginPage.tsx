import { useState, type FormEvent } from "react"
import logoImg from "@/imports/logo.png"
import { routes } from "@/config/routes"
import {
  demoAdminAccount,
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

  const safeRedirect =
    redirectTo &&
    redirectTo !== routes.adminLogin &&
    (redirectTo === routes.admin || redirectTo.startsWith("/admin/"))
      ? redirectTo
      : routes.adminRooms

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!username.trim() || !password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.")
      return
    }

    if (!loginAdmin(username, password)) {
      setError("Tên đăng nhập hoặc mật khẩu không đúng.")
      return
    }

    // Sau khi đăng nhập luôn chuyển vào khu vực Admin,
    // mặc định là /admin/phong.
    window.location.assign(safeRedirect)
  }

  const alreadyLoggedIn = isAdminAuthenticated()

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
          <p>HỆ THỐNG QUẢN TRỊ</p>
          <h1>Quản lý Cây Phượng K18</h1>
          <span>
            Khu vực quản trị các chức năng Sprint 1 và Sprint 2.
          </span>
        </div>
      </section>

      <section className="admin-login-panel">
        <div className="admin-login-card">
          <a className="admin-login-back" href={routes.home}>
            ← Quay lại website
          </a>

          <p className="admin-login-eyebrow">ADMIN PORTAL</p>
          <h2>Đăng nhập quản trị</h2>
          <p className="admin-login-intro">
            Nhập tài khoản quản trị để truy cập khu vực quản lý Cây Phượng K18.
          </p>

          {alreadyLoggedIn && (
            <div className="admin-login-success">
              Bạn đang đăng nhập.{" "}
              <a href={routes.adminRooms}>Vào trang quản trị →</a>
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

          <div className="admin-login-demo">
            <strong>Tài khoản demo</strong>
            <span>
              Tên đăng nhập: <code>{demoAdminAccount.username}</code>
            </span>
            <span>
              Mật khẩu: <code>{demoAdminAccount.password}</code>
            </span>
            <small>Authentication hiện là prototype frontend.</small>
          </div>
        </div>
      </section>
    </main>
  )
}
