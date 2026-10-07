import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import { CONTACT_UPDATED_EVENT, getContactSettings, getPhoneHref, normalizeContactHref } from "@/utils/contactStore"

export default function SocialRail() {
  const [open, setOpen] = useState(false)
  const [contact, setContact] = useState(getContactSettings)

  useEffect(() => {
    const refresh = () => setContact(getContactSettings())
    window.addEventListener("storage", refresh)
    window.addEventListener(CONTACT_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener(CONTACT_UPDATED_EVENT, refresh)
    }
  }, [])

  const channels = [
    { label: "Zalo", href: normalizeContactHref(contact.zalo, "zalo"), icon: "9d481.svg", className: "zalo" },
    { label: "Messenger", href: normalizeContactHref(contact.messenger, "messenger"), icon: "0a86e.svg", className: "messenger" },
    { label: "Điện thoại", href: getPhoneHref(contact.hotline), icon: "f991a.svg", className: "facebook" },
    { label: "Email", href: `mailto:${contact.email}`, icon: "540a2.svg", className: "email" },
  ]

  return (
    <aside className={`social-rail ${open ? "open" : ""}`} aria-label="Liên hệ nhanh">
      <span className="social-rail-title">Liên hệ</span>
      <div className="social-channel-list">
        {channels.map((channel) => (
          <a className={`social-channel ${channel.className}`} href={channel.href} aria-label={channel.label} onClick={() => setOpen(false)} target={channel.href.startsWith("http") ? "_blank" : undefined} rel={channel.href.startsWith("http") ? "noreferrer" : undefined} key={channel.label}>
            <img src={`${A}${channel.icon}`} alt="" /><span>{channel.label}</span>
          </a>
        ))}
      </div>
      <button className="social-toggle" aria-label={open ? "Đóng liên hệ nhanh" : "Mở liên hệ nhanh"} aria-expanded={open} onClick={() => setOpen(!open)}><img src={`${A}540a2.svg`} alt="" /><span>{open ? "×" : ""}</span></button>
    </aside>
  )
}
