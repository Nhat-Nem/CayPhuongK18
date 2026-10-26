import { useEffect, useState, type ReactNode } from "react"
import LanguageContext, { type Language } from "@/i18n/LanguageContext"
import usePageTranslation from "@/hooks/usePageTranslation"
import { routes } from "@/config/routes"
import HomePage from "@/pages/HomePage"
import RoomsPage from "@/pages/RoomsPage"
import BookingPage from "@/pages/BookingPage"
import MenuPage from "@/pages/MenuPage"
import AboutPage from "@/pages/AboutPage"
import CareersPage from "@/pages/CareersPage"
import CareerDetailPage from "@/pages/CareerDetailPage"
import ContactPage from "@/pages/ContactPage"
import OffersPage from "@/pages/OffersPage"
import OfferDetailPage from "@/pages/OfferDetailPage"
import RoomDetailPage from "@/pages/RoomDetailPage"
import MenuDetailPage from "@/pages/MenuDetailPage"
import AdminRoomsPage from "@/pages/admin/AdminRoomsPage"
import AdminRoomCreatePage from "@/pages/admin/AdminRoomCreatePage"
import AdminRoomEditPage from "@/pages/admin/AdminRoomEditPage"
import AdminMenuPage from "@/pages/admin/AdminMenuPage"
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage"
import AdminRoomBookingRequestsPage from "@/pages/admin/AdminRoomBookingRequestsPage"
import AdminWalkInPage from "@/pages/admin/AdminWalkInPage"
import AdminContactPage from "@/pages/admin/AdminContactPage"
import AdminLoginPage from "@/pages/admin/AdminLoginPage"
import AdminRecruitmentsPage from "@/pages/admin/AdminRecruitmentsPage"
import AdminRecruitmentCreatePage from "@/pages/admin/AdminRecruitmentCreatePage"
import AdminRecruitmentEditPage from "@/pages/admin/AdminRecruitmentEditPage"
import AdminPromotionsPage from "@/pages/admin/AdminPromotionsPage"
import { getAuthenticatedUser, isAdminAuthenticated } from "@/utils/adminAuth"

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem("language")
    return savedLanguage === "en" ? "en" : "vi"
  })

  usePageTranslation(language)

  const toggleLanguage = () => {
    setLanguage((currentLanguage) => {
      const nextLanguage = currentLanguage === "vi" ? "en" : "vi"
      window.localStorage.setItem("language", nextLanguage)
      return nextLanguage
    })
  }

  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  const requestedAdminPath = `${path}${window.location.search}`

  useEffect(() => {
    const titles: Record<string, string> = {
      [routes.home]: "Trang chủ",
      [routes.rooms]: "Phòng",
      [routes.booking]: "Đặt phòng",
      [routes.menu]: "Ẩm thực",
      [routes.offers]: "Ưu đãi",
      [routes.about]: "Câu chuyện",
      [routes.careers]: "Tuyển dụng",
      [routes.careerDetail]: "Chi tiết tuyển dụng",
      [routes.contact]: "Liên hệ",
      [routes.admin]: "Quản trị",
      [routes.adminLogin]: "Đăng nhập quản trị",
      [routes.adminRooms]: "Quản lý phòng",
      [routes.adminRoomCreate]: "Thêm phòng",
      [routes.adminRoomEdit]: "Sửa phòng",
      [routes.adminMenu]: "Quản lý thực đơn",
      [routes.adminOrders]: "Quản lý đơn hàng",
      [routes.adminRoomBookings]: "Tiếp nhận đặt phòng",
      [routes.adminWalkIns]: "Tiếp nhận khách vãng lai",
      [routes.adminContact]: "Quản lý liên hệ",
      [routes.adminRecruitments]: "Quản lý tuyển dụng",
      [routes.adminRecruitmentCreate]: "Thêm tuyển dụng",
      [routes.adminRecruitmentEdit]: "Sửa tuyển dụng",
      [routes.adminPromotions]: "Quản lý khuyến mãi",
    }

    let title = titles[path]

    if (path === "/phong/chi-tiet") title = "Chi tiết phòng"
    if (path === "/menu/chi-tiet") title = "Chi tiết món ăn"
    if (path === "/uu-dai/chi-tiet") title = "Chi tiết ưu đãi"

    document.title = `${title ?? "Cây Phượng K18"} | Cây Phượng K18`
  }, [path])
  const isAdminPage = path === routes.admin || path.startsWith("/admin/")
  const authenticatedUser = getAuthenticatedUser()

  let page: ReactNode

  // Trang đăng nhập Admin được phép truy cập khi chưa đăng nhập.
  if (path === routes.adminLogin) {
    page = <AdminLoginPage />
  }
  // Chặn toàn bộ khu vực /admin nếu chưa đăng nhập.
  else if (isAdminPage && !isAdminAuthenticated()) {
    page = <AdminLoginPage redirectTo={requestedAdminPath} />
  }
  // Nhân viên được sử dụng Quản lý đơn hàng và Quản lý thực đơn.
  // Các trang quản trị còn lại vẫn chuyển về khu vực đơn hàng.
  else if (
    isAdminPage &&
    authenticatedUser?.role === "STAFF" &&
    path !== routes.adminOrders &&
    path !== routes.adminMenu
  ) {
    page = <AdminOrdersPage />
  }
  // /admin là trang gốc quản trị -> vào danh sách phòng.
  else if (path === routes.admin) {
    page = <AdminRoomsPage />
  }
  // Sprint 1
  else if (path === routes.adminRoomCreate) {
    page = <AdminRoomCreatePage />
  }
  else if (path === routes.adminRoomEdit) {
    page = <AdminRoomEditPage />
  }
  else if (path === routes.adminRooms) {
    page = <AdminRoomsPage />
  }
  // Thực đơn
  else if (path === routes.adminMenu) {
    page = <AdminMenuPage />
  }
  // Đơn hàng
  else if (path === routes.adminOrders) {
    page = <AdminOrdersPage />
  }
  // Sprint 2
  else if (path === routes.adminRoomBookings) {
    page = <AdminRoomBookingRequestsPage />
  }
  else if (path === routes.adminWalkIns) {
    page = <AdminWalkInPage />
  }
  else if (path === routes.adminContact) {
    page = <AdminContactPage />
  }
  // Tuyển dụng · US.18–US.21
  else if (path === routes.adminRecruitmentCreate) {
    page = <AdminRecruitmentCreatePage />
  }
  else if (path === routes.adminRecruitmentEdit) {
    page = <AdminRecruitmentEditPage />
  }
  else if (path === routes.adminRecruitments) {
    page = <AdminRecruitmentsPage />
  }
  // Sprint 4 · Khuyến mãi
  else if (path === routes.adminPromotions) {
    page = <AdminPromotionsPage />
  }
  // Khách hàng
  else if (path === "/phong/chi-tiet") {
    page = <RoomDetailPage />
  }
  else if (path === "/menu/chi-tiet") {
    page = <MenuDetailPage />
  }
  else if (path === "/uu-dai/chi-tiet") {
    page = <OfferDetailPage />
  }
  else if (path === routes.rooms) {
    page = <RoomsPage />
  }
  else if (path === routes.booking) {
    page = <BookingPage />
  }
  else if (path === routes.menu) {
    page = <MenuPage />
  }
  else if (path === routes.about) {
    page = <AboutPage />
  }
  else if (path === routes.careerDetail) {
    page = <CareerDetailPage />
  }
  else if (path === routes.careers) {
    page = <CareersPage />
  }
  else if (path === routes.contact) {
    page = <ContactPage />
  }
  else if (path === routes.offers) {
    page = <OffersPage />
  }
  else {
    page = <HomePage />
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {page}
    </LanguageContext.Provider>
  )
}
