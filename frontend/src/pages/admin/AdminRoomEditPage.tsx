import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import RoomForm from "@/components/admin/RoomForm"
import { routes } from "@/config/routes"
import { getRoomById } from "@/utils/roomStore"

export default function AdminRoomEditPage() {
  const roomId = new URLSearchParams(window.location.search).get("id")
  const room = getRoomById(roomId)

  if (!room) {
    return (
      <AdminRoomLayout title="Không tìm thấy phòng" subtitle="Phòng cần sửa không còn tồn tại trong dữ liệu hiện tại." primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}>
        <div className="admin-room-empty"><strong>Không tìm thấy dữ liệu phòng.</strong><span>Hãy quay lại danh sách và chọn một phòng khác.</span></div>
      </AdminRoomLayout>
    )
  }

  return (
    <AdminRoomLayout
      title="Sửa thông tin phòng"
      subtitle={`US.04 · Chỉnh sửa ${room.code}. Thay đổi được lưu tạm ở frontend và sẵn sàng thay bằng PUT /api/rooms/:id.`}
      primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}
    >
      <RoomForm mode="edit" room={room} />
    </AdminRoomLayout>
  )
}
