export interface ContactSettings {
  hotline: string
  zalo: string
  messenger: string
  email: string
}

export const CONTACT_STORAGE_KEY = "cay-phuong-contact-settings"
const LEGACY_CONTACT_STORAGE_KEY = "cay-phuong-contact-prototype"
export const CONTACT_UPDATED_EVENT = "cay-phuong-contact-updated"

export const defaultContactSettings: ContactSettings = {
  hotline: "1900 0980",
  zalo: "#zalo",
  messenger: "#messenger",
  email: "cayphuongk18@gmail.com",
}

export function getContactSettings(): ContactSettings {
  try {
    const saved = window.localStorage.getItem(CONTACT_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_CONTACT_STORAGE_KEY)
    return saved
      ? { ...defaultContactSettings, ...(JSON.parse(saved) as Partial<ContactSettings>) }
      : defaultContactSettings
  } catch {
    return defaultContactSettings
  }
}

export function saveContactSettings(contact: ContactSettings) {
  window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact))
  window.dispatchEvent(new CustomEvent(CONTACT_UPDATED_EVENT, { detail: contact }))
}

export function getPhoneHref(hotline: string) {
  const normalized = hotline.replace(/[^0-9+]/g, "")
  return normalized ? `tel:${normalized}` : "#"
}

export function normalizeContactHref(value: string, kind: "zalo" | "messenger") {
  const trimmed = value.trim()
  if (!trimmed) return "#"
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("#")) return trimmed

  if (kind === "zalo") {
    const digits = trimmed.replace(/\D/g, "")
    return digits.length >= 9 ? `https://zalo.me/${digits}` : "#zalo"
  }

  const slug = trimmed.replace(/^@/, "").replace(/\s+/g, "")
  return slug ? `https://m.me/${slug}` : "#messenger"
}
