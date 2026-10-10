import { useEffect, useState, type FormEvent } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import { defaultContactSettings, getContactSettings, updateContactSettings, type ContactSettings } from "@/services/contactApi"

export default function AdminContactPage() {
  const [contact, setContact] = useState<ContactSettings>(defaultContactSettings)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  useEffect(() => { void getContactSettings().then(setContact).catch((err: Error) => setError(err.message)) }, [])
  const updateField = (field: keyof ContactSettings, value: string) => { setSaved(false); setContact((current) => ({ ...current, [field]: value })) }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError("")
    try { setContact(await updateContactSettings(contact)); setSaved(true) }
    catch (err) { setError(err instanceof Error ? err.message : "Không thể lưu thông tin liên hệ") }
    finally { setSaving(false) }
  }
  return <AdminRoomLayout eyebrow="SPRINT 2 · US.09" title="Quản lý thông tin liên hệ" subtitle="Hotline, Zalo, Messenger và Email được lấy/lưu qua GET và PATCH /api/v1/contact.">
    <div className="admin-contact-layout"><section className="admin-s2-form-card"><div className="admin-s2-section-heading"><div><span>THÔNG TIN LIÊN HỆ</span><h2>Cập nhật kênh hỗ trợ khách hàng</h2></div></div><form className="admin-contact-form" onSubmit={submit}>
      <label><span>Hotline *</span><small>Số điện thoại hiển thị ở nút Hotline cố định.</small><input required value={contact.hotline} onChange={(e) => updateField("hotline", e.target.value)} /></label>
      <label><span>Zalo *</span><small>Nhập URL Zalo hoặc số điện thoại Zalo.</small><input required value={contact.zalo} onChange={(e) => updateField("zalo", e.target.value)} /></label>
      <label><span>Messenger *</span><small>Nhập URL Messenger hoặc username Facebook.</small><input required value={contact.messenger} onChange={(e) => updateField("messenger", e.target.value)} /></label>
      <label><span>Email *</span><small>Email tiếp nhận yêu cầu và phản hồi khách hàng.</small><input required type="email" value={contact.email} onChange={(e) => updateField("email", e.target.value)} /></label>
      {saved && <p className="admin-contact-success">✓ Đã lưu vào database.</p>}{error && <p className="booking-form-error">{error}</p>}
      <div className="admin-s2-form-actions"><button className="admin-secondary-button" type="button" onClick={() => {setContact(defaultContactSettings);setSaved(false)}}>Khôi phục mẫu</button><button className="admin-primary-button" disabled={saving} type="submit">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button></div>
    </form></section><aside className="admin-contact-preview"><span className="admin-contact-preview-label">XEM TRƯỚC</span><h2>Liên hệ Cây Phượng K18</h2><p>Thông tin dưới đây được đồng bộ với backend.</p><div><article><span>Hotline</span><strong>{contact.hotline || "—"}</strong></article><article><span>Zalo</span><strong>{contact.zalo || "—"}</strong></article><article><span>Messenger</span><strong>{contact.messenger || "—"}</strong></article><article><span>Email</span><strong>{contact.email || "—"}</strong></article></div><a href="/lien-he" target="_blank" rel="noreferrer">Mở trang liên hệ khách hàng ↗</a></aside></div>
  </AdminRoomLayout>
}
