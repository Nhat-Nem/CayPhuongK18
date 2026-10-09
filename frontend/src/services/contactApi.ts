import { apiRequest } from "./api"

export interface ContactSettings {
  hotline: string
  zalo: string
  messenger: string
  email: string
}

export const defaultContactSettings: ContactSettings = {
  hotline: "1900 0980",
  zalo: "#zalo",
  messenger: "#messenger",
  email: "cayphuongk18@gmail.com",
}

export const CONTACT_UPDATED_EVENT = "cay-phuong-contact-updated"

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    return await apiRequest<ContactSettings>("/contact-settings")
  } catch {
    return defaultContactSettings
  }
}

export async function updateContactSettings(contact: ContactSettings): Promise<ContactSettings> {
  const saved = await apiRequest<ContactSettings>("/contact-settings", {
    method: "PUT",
    body: JSON.stringify(contact),
  })
  window.dispatchEvent(new CustomEvent(CONTACT_UPDATED_EVENT, { detail: saved }))
  return saved
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
