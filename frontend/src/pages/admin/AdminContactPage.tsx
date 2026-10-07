import { useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { defaultContactSettings, getContactSettings, saveContactSettings, type ContactSettings } from "@/utils/contactStore"

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactSettings>(getContactSettings)
  const [saved, setSaved] = useState(false)

  const updateField = (field: keyof ContactSettings, value: string) => {
    setSaved(false)
    setContact((current) => ({ ...current, [field]: value }))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveContactSettings(contact)
    setSaved(true)
  }

  return (
    <AdminRoomLayout eyebrow="SPRINT 2 · US.09" title="Quản lý thông tin liên hệ" subtitle="Giao diện cập nhật Hotline, Zalo, Messenger và Email. Dữ liệu đang lưu ở frontend và được dùng ngay trên website; khi có backend chỉ cần thay lớp lưu trữ bằng API.">
      <div className="admin-contact-layout">
        <section className="admin-s2-form-card">
          <div className="admin-s2-section-heading"><div><span>THÔNG TIN LIÊN HỆ</span><h2>Cập nhật kênh hỗ trợ khách hàng</h2></div></div>
          <form className="admin-contact-form" onSubmit={submit}>
            <label><span>Hotline *</span><small>Số điện thoại hiển thị ở nút Hotline cố định.</small><input required value={contact.hotline} onChange={(event) => updateField("hotline", event.target.value)} /></label>
            <label><span>Zalo *</span><small>Nhập URL Zalo hoặc số điện thoại Zalo.</small><input required value={contact.zalo} onChange={(event) => updateField("zalo", event.target.value)} placeholder="https://zalo.me/..." /></label>
            <label><span>Messenger *</span><small>Nhập URL Messenger hoặc username Facebook.</small><input required value={contact.messenger} onChange={(event) => updateField("messenger", event.target.value)} placeholder="https://m.me/..." /></label>
            <label><span>Email *</span><small>Email tiếp nhận yêu cầu và phản hồi khách hàng.</small><input required type="email" value={contact.email} onChange={(event) => updateField("email", event.target.value)} /></label>
            {saved && <p className="admin-contact-success">✓ Đã lưu. Trang liên hệ và thanh liên hệ nhanh sẽ dùng dữ liệu mới.</p>}
            <div className="admin-s2-form-actions">
              <button className="admin-secondary-button" type="button" onClick={() => {setContact(defaultContactSettings);setSaved(false)}}>Khôi phục mẫu</button>
              <button className="admin-primary-button" type="submit">Lưu thay đổi</button>
            </div>
          </form>
        </section>
        <aside className="admin-contact-preview"><span className="admin-contact-preview-label">XEM TRƯỚC</span><h2>Liên hệ Cây Phượng K18</h2><p>Thông tin dưới đây chính là dữ liệu frontend đang dùng.</p><div><article><span>Hotline</span><strong>{contact.hotline || "—"}</strong></article><article><span>Zalo</span><strong>{contact.zalo || "—"}</strong></article><article><span>Messenger</span><strong>{contact.messenger || "—"}</strong></article><article><span>Email</span><strong>{contact.email || "—"}</strong></article></div><a href="/lien-he" target="_blank" rel="noreferrer">Mở trang liên hệ khách hàng ↗</a></aside>
      </div>
    </AdminRoomLayout>
  )
}
