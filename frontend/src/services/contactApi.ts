import { apiRequest } from "@/services/api"

export interface ContactSettings {
  hotline: string
  zalo: string
  messenger: string
  email: string
}

interface ContactApiRecord extends ContactSettings {
  id?: number | string
  updated_at?: string
  updated_by?: number | string | null
}

export const defaultContactSettings: ContactSettings = {
  hotline: "1900 0980",
  zalo: "#zalo",
  messenger: "#messenger",
  email: "cayphuongk18@gmail.com",
}

export const CONTACT_UPDATED_EVENT = "cay-phuong-contact-updated"

function mapContact(row: ContactApiRecord): ContactSettings {
  return {
    hotline: row.hotline,
    zalo: row.zalo,
    messenger: row.messenger,
    email: row.email,
  }
}

/**
 * Backend:
 * GET /api/v1/contact
 */
export async function getContactSettings(): Promise<ContactSettings> {
  const row = await apiRequest<ContactApiRecord>("/api/v1/contact")
  return mapContact(row)
}

/**
 * Backend:
 * PATCH /api/v1/contact
 *
 * DTO backend hỗ trợ đúng 4 field:
 * hotline, zalo, messenger, email.
 */
export async function updateContactSettings(
  contact: ContactSettings,
): Promise<ContactSettings> {
  const row = await apiRequest<ContactApiRecord>("/api/v1/contact", {
    method: "PATCH",
    body: JSON.stringify({
      hotline: contact.hotline.trim(),
      zalo: contact.zalo.trim(),
      messenger: contact.messenger.trim(),
      email: contact.email.trim(),
    }),
  })

  const saved = mapContact(row)

  window.dispatchEvent(
    new CustomEvent(CONTACT_UPDATED_EVENT, {
      detail: saved,
    }),
  )

  return saved
}

export function getPhoneHref(hotline: string) {
  const normalized = hotline.replace(/[^0-9+]/g, "")
  return normalized ? `tel:${normalized}` : "#"
}

export function normalizeContactHref(
  value: string,
  kind: "zalo" | "messenger",
) {
  const trimmed = value.trim()

  if (!trimmed) return "#"

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("#")
  ) {
    return trimmed
  }

  if (kind === "zalo") {
    const digits = trimmed.replace(/\D/g, "")
    return digits.length >= 9
      ? `https://zalo.me/${digits}`
      : "#zalo"
  }

  const slug = trimmed
    .replace(/^@/, "")
    .replace(/\s+/g, "")

  return slug
    ? `https://m.me/${slug}`
    : "#messenger"
}
