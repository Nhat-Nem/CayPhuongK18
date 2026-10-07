import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import { CONTACT_UPDATED_EVENT, getContactSettings, getPhoneHref } from "@/utils/contactStore"

export default function QuickPhone() {
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

  return (
    <a className="quick-phone" href={getPhoneHref(contact.hotline)} aria-label={`Gọi ${contact.hotline}`}>
      <span className="quick-phone-icon"><img src={`${A}f995f.png`} alt="" /></span>
      <span className="quick-phone-copy"><small>Hotline</small><strong>{contact.hotline}</strong></span>
    </a>
  )
}
