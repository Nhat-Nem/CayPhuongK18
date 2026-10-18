import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import RecruitmentCreateForm from "@/components/admin/RecruitmentCreateForm"
import { routes } from "@/config/routes"

export default function AdminRecruitmentCreatePage() {
  return (
    <AdminRoomLayout
      eyebrow="TUYỂN DỤNG"
      title="Thêm thông tin tuyển dụng"
      subtitle="Tạo vị trí tuyển dụng mới. Nội dung sau khi lưu sẽ xuất hiện trong danh sách Admin và trang Tuyển dụng dành cho khách."
      primaryAction={
        <a className="admin-text-link" href={routes.adminRecruitments}>
          ← Danh sách tuyển dụng
        </a>
      }
    >
      <section className="admin-recruitment-edit-card">
        <div className="admin-s2-section-heading">
          <div>
            <span>THÔNG TIN VỊ TRÍ</span>
            <h2>Vị trí tuyển dụng mới</h2>
          </div>
        </div>

        <RecruitmentCreateForm />
      </section>
    </AdminRoomLayout>
  )
}
