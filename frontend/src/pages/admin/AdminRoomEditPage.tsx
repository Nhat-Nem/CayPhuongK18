import { useEffect, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import RoomForm from "@/components/admin/RoomForm"
import { routes } from "@/config/routes"
import type { RoomPrototype } from "@/data/roomPrototype"
import { getRoomById } from "@/services/roomApi"

export default function AdminRoomEditPage() {
  const roomId = new URLSearchParams(window.location.search).get("id")
  const [room, setRoom] = useState<RoomPrototype | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!roomId) { setError("Thiếu ID phòng."); setLoading(false); return }
    getRoomById(roomId).then(setRoom).catch((err: Error) => setError(err.message)).finally(() => setLoading(false))
  }, [roomId])

  if (loading) return <AdminRoomLayout title="Đang tải phòng" subtitle="Đang lấy dữ liệu từ GET /rooms/:id" primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}><div className="admin-room-empty"><strong>Đang tải...</strong></div></AdminRoomLayout>
  if (!room) return <AdminRoomLayout title="Không tìm thấy phòng" subtitle={error || "Phòng cần sửa không tồn tại."} primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}><div className="admin-room-empty"><strong>Không tìm thấy dữ liệu phòng.</strong></div></AdminRoomLayout>

  return <AdminRoomLayout title="Sửa thông tin phòng" subtitle={`US.04 · Chỉnh sửa ${room.code}. Thay đổi được gửi bằng PATCH /rooms/${room.id}.`} primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}><RoomForm mode="edit" room={room} /></AdminRoomLayout>
}
