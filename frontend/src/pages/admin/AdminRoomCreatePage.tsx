import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import RoomForm from "@/components/admin/RoomForm"
import { routes } from "@/config/routes"

export default function AdminRoomCreatePage() {
  return (
    <AdminRoomLayout
      title="Thêm phòng mới"
      subtitle="US.03 · Giao diện thêm phòng. Dữ liệu được lưu tạm ở frontend và có thể thay bằng POST /api/rooms khi backend hoàn thành."
      primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}
    >
      <RoomForm mode="create" />
    </AdminRoomLayout>
  )
}
