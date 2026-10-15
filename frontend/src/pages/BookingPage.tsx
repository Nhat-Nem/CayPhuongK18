import { useEffect } from "react"

/**
 * US.06 dùng lại đúng giao diện Yêu cầu trực tuyến của trang Liên hệ.
 * Route /dat-phong vẫn được giữ để các nút cũ không bị hỏng.
 */
export default function BookingPage() {
  useEffect(() => {
    const current = new URLSearchParams(window.location.search)
    const next = new URLSearchParams({ type: "room" })
    const room = current.get("room")

    if (room) {
      next.set("room", room)
    }

    window.location.replace(
      `/lien-he?${next.toString()}#yeu-cau-truc-tuyen`,
    )
  }, [])

  return null
}
