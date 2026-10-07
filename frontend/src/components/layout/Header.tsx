import { useContext, useState } from "react"
import logoImg from "@/imports/logo.png"
import LanguageContext from "@/i18n/LanguageContext"
import { routes } from "@/config/routes"

export default function Header() {
  const [open, setOpen] = useState(false)
  const { language } = useContext(LanguageContext)
  const links = [
    ["TRANG CHỦ", routes.home],
    ["PHÒNG", routes.rooms],
    ["ẨM THỰC", routes.menu],
    ["ƯU ĐÃI", routes.offers],
    ["CÂU CHUYỆN", routes.about],
    ["TUYỂN DỤNG", routes.careers],
    ["LIÊN HỆ", routes.contact],
  ]
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Điều hướng chính">
        <a className="logo" href="/" aria-label="Cây Phượng K18 - Trang chủ">
          <img src={logoImg} alt="Cây Phượng K18" />
        </a>
        <div className="nav-group nav-center">
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a className="header-booking" href="/lien-he?type=table">
            <span>Đặt bàn</span>
            <i>→</i>
          </a>
        </div>
        <button
          className="menu-toggle"
          aria-label="Mở trình đơn"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "×" : "☰"}
        </button>
      </nav>
      {open && (
        <div className="mobile-menu">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

