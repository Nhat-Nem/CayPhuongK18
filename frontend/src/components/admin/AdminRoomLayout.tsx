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
          <p>PHÒNG</p>
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

          <p>THỰC ĐƠN</p>
          <a
            className={path === routes.adminMenu ? "active" : ""}
            href={routes.adminMenu}
          >
            <span>▤</span> Quản lý thực đơn
          </a>

          <p>TIẾP NHẬN</p>
          <a
            className={path === routes.adminRoomBookings ? "active" : ""}
            href={routes.adminRoomBookings}
          >
            <span>▤</span> Tiếp nhận đặt phòng
          </a>
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

          <p>TUYỂN DỤNG · US.18–US.21</p>
          <a
            className={
              path === routes.adminRecruitments ||
              path === routes.adminRecruitmentCreate ||
              path === routes.adminRecruitmentEdit
                ? "active"
                : ""
            }
            href={routes.adminRecruitments}
          >
            <span>▤</span> Danh sách tuyển dụng
          </a>

          <p>WEBSITE</p>
          <a href={routes.rooms}>
            <span>↗</span> Xem trang phòng
          </a>
          <a href={routes.menu}>
            <span>↗</span> Xem trang thực đơn
          </a>
          <a href={routes.contact}>
            <span>↗</span> Xem trang liên hệ
          </a>
          <a href={routes.careers}>
            <span>↗</span> Xem trang tuyển dụng
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
