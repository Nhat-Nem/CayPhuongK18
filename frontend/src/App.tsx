import { useState, type ReactNode } from "react"
import LanguageContext, { type Language } from "@/i18n/LanguageContext"
import usePageTranslation from "@/hooks/usePageTranslation"
import { routes } from "@/config/routes"
import HomePage from "@/pages/HomePage"
import RoomsPage from "@/pages/RoomsPage"
import BookingPage from "@/pages/BookingPage"
import MenuPage from "@/pages/MenuPage"
import AboutPage from "@/pages/AboutPage"
import CareersPage from "@/pages/CareersPage"
import ContactPage from "@/pages/ContactPage"
import OffersPage from "@/pages/OffersPage"
import OfferDetailPage from "@/pages/OfferDetailPage"
import RoomDetailPage from "@/pages/RoomDetailPage"
import MenuDetailPage from "@/pages/MenuDetailPage"
import AdminRoomsPage from "@/pages/admin/AdminRoomsPage"
import AdminRoomCreatePage from "@/pages/admin/AdminRoomCreatePage"
import AdminRoomEditPage from "@/pages/admin/AdminRoomEditPage"
import AdminWalkInPage from "@/pages/admin/AdminWalkInPage"
import AdminContactPage from "@/pages/admin/AdminContactPage"
import AdminLoginPage from "@/pages/admin/AdminLoginPage"
import { isAdminAuthenticated } from "@/utils/adminAuth"

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
  const isAdminPage = path === routes.admin || path.startsWith("/admin/")

  let page: ReactNode

  // Trang đăng nhập Admin được phép truy cập khi chưa đăng nhập.
  if (path === routes.adminLogin) {
    page = <AdminLoginPage />
  }
  // Chặn toàn bộ khu vực /admin nếu chưa đăng nhập.
  else if (isAdminPage && !isAdminAuthenticated()) {
    page = <AdminLoginPage redirectTo={requestedAdminPath} />
  }
  // /admin là trang gốc quản trị -> vào danh sách phòng Sprint 1.
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
  // Sprint 2
  else if (path === routes.adminWalkIns) {
    page = <AdminWalkInPage />
  }
  else if (path === routes.adminContact) {
    page = <AdminContactPage />
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
