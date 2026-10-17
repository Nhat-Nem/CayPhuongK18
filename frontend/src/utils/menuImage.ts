const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SOURCE_SIZE = 8 * 1024 * 1024

// MySQL TEXT chứa tối đa khoảng 65 KB. Giữ data URL dưới 50 KB để còn dư
// an toàn cho prefix data:image/... và payload JSON của request.
const TARGET_DATA_URL_LENGTH = 50_000

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(new Error("Không thể đọc file ảnh đã chọn."))
    reader.readAsDataURL(file)
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Không thể xử lý file ảnh đã chọn."))
    image.src = source
  })
}

/**
 * Đọc ảnh từ máy, nén sang WEBP rồi trả về data URL.
 * Kết quả vẫn là string nên dùng trực tiếp field image hiện có của menu-items,
 * không cần tạo endpoint upload mới.
 */
export async function fileToMenuImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.")
  }

  if (file.size > MAX_SOURCE_SIZE) {
    throw new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 8 MB.")
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)

  const maxWidth = 720
  const maxHeight = 540
  const initialScale = Math.min(
    1,
    maxWidth / image.width,
    maxHeight / image.height,
  )

  let width = Math.max(1, Math.round(image.width * initialScale))
  let height = Math.max(1, Math.round(image.height * initialScale))

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh.")
  }

  for (let resizeAttempt = 0; resizeAttempt < 7; resizeAttempt += 1) {
    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    for (let quality = 0.78; quality >= 0.16; quality -= 0.06) {
      const result = canvas.toDataURL("image/webp", quality)
      if (result.length <= TARGET_DATA_URL_LENGTH) {
        return result
      }
    }

    width = Math.max(1, Math.round(width * 0.82))
    height = Math.max(1, Math.round(height * 0.82))
  }

  throw new Error(
    "Ảnh vẫn quá lớn sau khi nén. Hãy chọn ảnh có kích thước nhỏ hơn.",
  )
}
