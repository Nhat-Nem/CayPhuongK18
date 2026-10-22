const FEATURED_REVIEWS_KEY = "cay-phuong-featured-review-ids"
export const FEATURED_REVIEWS_UPDATED_EVENT = "cay-phuong-featured-reviews-updated"

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage)
}

export function getFeaturedReviewIds(): string[] {
  if (!canUseStorage()) return []

  try {
    const raw = window.localStorage.getItem(FEATURED_REVIEWS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function isReviewFeatured(id: string) {
  return getFeaturedReviewIds().includes(String(id))
}

export function setReviewFeatured(id: string, featured: boolean) {
  const current = getFeaturedReviewIds()
  const next = featured
    ? Array.from(new Set([...current, String(id)]))
    : current.filter((item) => item !== String(id))

  if (canUseStorage()) {
    window.localStorage.setItem(FEATURED_REVIEWS_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(FEATURED_REVIEWS_UPDATED_EVENT))
  }

  return next
}
