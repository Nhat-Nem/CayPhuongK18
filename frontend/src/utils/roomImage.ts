const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SOURCE_SIZE = 8 * 1024 * 1024

/**
 * Nest/Express mặc định thường giới hạn JSON body khoảng 100 KB.
 * Một request phòng có thể chứa tối đa 5 data URL nên mỗi ảnh được nén
 * đủ nhỏ để tổng payload vẫn an toàn mà không cần sửa backend.
 */
const TARGET_DATA_URL_LENGTH = 16_000

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
 * Kết quả vẫn là string nên tương thích với image/secondaryImage hiện có
 * của backend, không cần tạo API upload mới.
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

  const maxWidth = 760
  const maxHeight = 560
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

  // Nếu ảnh vẫn lớn, giảm dần quality và kích thước cho tới khi đủ nhỏ.
  for (let resizeAttempt = 0; resizeAttempt < 6; resizeAttempt += 1) {
    canvas.width = width
    canvas.height = height

    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    for (let quality = 0.76; quality >= 0.18; quality -= 0.07) {
      const result = canvas.toDataURL("image/webp", quality)

      if (result.length <= TARGET_DATA_URL_LENGTH) {
        return result
      }
    }

    width = Math.max(1, Math.round(width * 0.8))
    height = Math.max(1, Math.round(height * 0.8))
  }

  throw new Error(
    "Ảnh vẫn quá lớn sau khi nén. Hãy chọn ảnh có kích thước nhỏ hơn.",
  )
}
