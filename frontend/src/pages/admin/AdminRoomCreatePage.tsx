import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import RoomForm from "@/components/admin/RoomForm"
import { routes } from "@/config/routes"

export default function AdminRoomCreatePage() {
  return <AdminRoomLayout title="Thêm phòng mới" subtitle="Bổ sung thông tin phòng để hiển thị và quản lý trong hệ thống." primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}><RoomForm mode="create" /></AdminRoomLayout>
}
