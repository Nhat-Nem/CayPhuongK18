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
  let page: ReactNode = <HomePage />

  const isAdminPage = path.startsWith("/admin/") && path !== routes.adminLogin
  const requestedAdminPath = `${path}${window.location.search}`

  if (path === routes.adminLogin) page = <AdminLoginPage />
  else if (isAdminPage && !isAdminAuthenticated()) {
    page = <AdminLoginPage redirectTo={requestedAdminPath} />
  } else if (path === routes.adminRoomCreate) page = <AdminRoomCreatePage />
  else if (path === routes.adminRoomEdit) page = <AdminRoomEditPage />
  else if (path === routes.adminRooms) page = <AdminRoomsPage />
  else if (path === routes.adminWalkIns) page = <AdminWalkInPage />
  else if (path === routes.adminContact) page = <AdminContactPage />
  else if (path === "/phong/chi-tiet") page = <RoomDetailPage />
  else if (path === "/menu/chi-tiet") page = <MenuDetailPage />
  else if (path === "/uu-dai/chi-tiet") page = <OfferDetailPage />
  else if (path === routes.rooms) page = <RoomsPage />
  else if (path === routes.booking) page = <BookingPage />
  else if (path === routes.menu) page = <MenuPage />
  else if (path === routes.about) page = <AboutPage />
  else if (path === routes.careers) page = <CareersPage />
  else if (path === routes.contact) page = <ContactPage />
  else if (path === routes.offers) page = <OffersPage />

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {page}
    </LanguageContext.Provider>
  )
}
