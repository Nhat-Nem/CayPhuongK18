export const A = "/assets/"

/**
 * Ảnh cũ của website chỉ lưu tên file trong public/assets.
 * Ảnh được chọn trực tiếp từ máy sẽ được lưu dưới dạng data URL.
 * Hàm này giúp cả hai kiểu dữ liệu hiển thị cùng nhau.
 */
export function resolveImageSource(image?: string | null): string {
  const value = image?.trim()

  if (!value) return `${A}8bb71.png`

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value
  }

  return `${A}${value}`
}
