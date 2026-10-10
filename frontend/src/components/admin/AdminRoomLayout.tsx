import type { ReactNode } from "react"
import { routes } from "@/config/routes"
import { logoutAdmin } from "@/utils/adminAuth"

interface AdminRoomLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  primaryAction?: ReactNode
  eyebrow?: string
}

export default function AdminRoomLayout({
  title,
  subtitle,
  children,
  primaryAction,
  eyebrow = "QUẢN LÝ PHÒNG",
}: AdminRoomLayoutProps) {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"

  return (
    <div className="admin-room-app">
      <aside className="admin-room-sidebar">
        <a className="admin-room-brand" href={routes.adminRooms}>
          <span>CP</span>
          <div>
            <strong>Cây Phượng K18</strong>
            <small>Quản trị hệ thống</small>
          </div>
        </a>

        <nav className="admin-room-nav" aria-label="Điều hướng quản trị">
          <p>SPRINT 1 · PHÒNG</p>
          <a
            className={path === routes.adminRooms ? "active" : ""}
            href={routes.adminRooms}
          >
            <span>▦</span> Danh sách phòng
          </a>
          <a
            className={path === routes.adminRoomCreate ? "active" : ""}
            href={routes.adminRoomCreate}
          >
            <span>＋</span> Thêm phòng
          </a>

          <p>SPRINT 2 · TIẾP NHẬN</p>
          <a
            className={path === routes.adminWalkIns ? "active" : ""}
            href={routes.adminWalkIns}
          >
            <span>♙</span> Khách vãng lai
          </a>
          <a
            className={path === routes.adminContact ? "active" : ""}
            href={routes.adminContact}
          >
            <span>☎</span> Thông tin liên hệ
          </a>

          <p>WEBSITE</p>
          <a href={routes.rooms}>
            <span>↗</span> Xem trang phòng
          </a>
          <a href={routes.contact}>
            <span>↗</span> Xem trang liên hệ
          </a>
        </nav>

        <button
          className="admin-room-logout"
          type="button"
          onClick={() => {
            logoutAdmin()
            window.location.href = routes.adminLogin
          }}
        >
          <span>↪</span> Đăng xuất
        </button>

        <div className="admin-room-sidebar-note">
          <strong>Sprint 1–2 · Full stack</strong>
          <span>US.01–US.09</span>
          <small>Frontend đã nối với NestJS/MySQL cho phòng, đặt phòng, khách vãng lai và thông tin liên hệ.</small>
        </div>
      </aside>

      <main className="admin-room-main">
        <header className="admin-room-topbar">
          <div>
            <p className="admin-room-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {primaryAction && <div>{primaryAction}</div>}
        </header>
        {children}
      </main>
    </div>
  )
}
