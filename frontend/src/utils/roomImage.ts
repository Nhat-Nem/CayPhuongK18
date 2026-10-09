const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SOURCE_SIZE = 8 * 1024 * 1024
const TARGET_DATA_URL_LENGTH = 58_000

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Không thể đọc file ảnh đã chọn."))
    image.src = source
  })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh đã chọn."))
    reader.readAsDataURL(file)
  })
}

/**
 * Frontend-only: đọc ảnh trên máy và nén thành WebP data URL.
 * Kết quả vẫn là string nên tương thích với field image/secondaryImage hiện tại.
 */
export async function fileToRoomImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.")
  }

  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 8 MB.")
  }

  const originalDataUrl = await readFileAsDataUrl(file)
  const image = await loadImage(originalDataUrl)

  const maxWidth = 900
  const maxHeight = 650
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height)
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.")

  context.drawImage(image, 0, 0, width, height)

  // MySQL TEXT có giới hạn khoảng 64 KB. Nén ảnh đủ nhỏ để có thể
  // gửi qua field string hiện tại mà không cần API upload riêng.
  for (let quality = 0.78; quality >= 0.25; quality -= 0.07) {
    const result = canvas.toDataURL("image/webp", quality)
    if (result.length <= TARGET_DATA_URL_LENGTH) return result
  }

  throw new Error(
    "Ảnh vẫn quá lớn sau khi nén. Hãy chọn ảnh có kích thước nhỏ hơn hoặc tỉ lệ đơn giản hơn.",
  )
}
