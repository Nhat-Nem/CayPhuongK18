import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import { CONTACT_UPDATED_EVENT, defaultContactSettings, getContactSettings, getPhoneHref } from "@/services/contactApi"

export default function QuickPhone() {
  const [contact, setContact] = useState(defaultContactSettings)
  useEffect(() => {
    const refresh = () => { void getContactSettings().then(setContact) }
    refresh()
    window.addEventListener(CONTACT_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CONTACT_UPDATED_EVENT, refresh)
  }, [])
  return <a className="quick-phone" href={getPhoneHref(contact.hotline)} aria-label={`Gọi ${contact.hotline}`}><span className="quick-phone-icon"><img src={`${A}f995f.png`} alt="" /></span><span className="quick-phone-copy"><small>Hotline</small><strong>{contact.hotline}</strong></span></a>
}
