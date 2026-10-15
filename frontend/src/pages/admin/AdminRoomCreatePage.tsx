import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import RoomForm from "@/components/admin/RoomForm"
import { routes } from "@/config/routes"

export default function AdminRoomCreatePage() {
  return <AdminRoomLayout title="Thêm phòng mới" subtitle="US.03 · Form này gửi POST /api/v1/rooms và lưu phòng trực tiếp vào MySQL." primaryAction={<a className="admin-text-link" href={routes.adminRooms}>← Danh sách phòng</a>}><RoomForm mode="create" /></AdminRoomLayout>
}
