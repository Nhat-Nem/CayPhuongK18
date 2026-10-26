import type { ReactNode } from "react"
import { routes } from "@/config/routes"
import { getAuthenticatedUser, logoutAdmin } from "@/utils/adminAuth"

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
  const currentUser = getAuthenticatedUser()
  const isStaff = currentUser?.role === "STAFF"
  const portalHome = isStaff ? routes.adminOrders : routes.adminRooms

  return (
    <div className="admin-room-app">
      <aside className="admin-room-sidebar">
        <a className="admin-room-brand" href={portalHome}>
          <span>CP</span>
          <div>
            <strong>Cây Phượng K18</strong>
            <small>{isStaff ? "Khu vực nhân viên" : "Quản trị hệ thống"}</small>
          </div>
        </a>

        <nav className="admin-room-nav" aria-label="Điều hướng quản trị">
          {!isStaff && (
            <>
              <p>PHÒNG</p>
              <a
                className={path === routes.adminRooms ? "active" : ""}
                href={routes.adminRooms}
              >
                <span>▦</span> Danh sách phòng
              </a>
            </>
          )}

          <p>THỰC ĐƠN</p>
          <a
            className={path === routes.adminMenu ? "active" : ""}
            href={routes.adminMenu}
          >
            <span>▤</span> Quản lý thực đơn
          </a>

          <p>ĐƠN HÀNG</p>
          <a
            className={path === routes.adminOrders ? "active" : ""}
            href={routes.adminOrders}
          >
            <span>▣</span> Quản lý đơn hàng
          </a>

          {!isStaff && (
            <>
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
                <span>♙</span> Tiếp nhận khách vãng lai
              </a>
              <a
                className={path === routes.adminContact ? "active" : ""}
                href={routes.adminContact}
              >
                <span>☎</span> Thông tin liên hệ
              </a>

              <p>TUYỂN DỤNG</p>
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

              <p>KHUYẾN MÃI</p>
              <a
                className={path === routes.adminPromotions ? "active" : ""}
                href={routes.adminPromotions}
              >
                <span>%</span> Quản lý khuyến mãi
              </a>
            </>
          )}

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
          <a href={routes.offers}>
            <span>↗</span> Xem trang ưu đãi
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
