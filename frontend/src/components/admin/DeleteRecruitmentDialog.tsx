import type { RecruitmentRecord } from "@/data/recruitmentPrototype"

interface DeleteRecruitmentDialogProps {
  recruitment: RecruitmentRecord | null
  onCancel: () => void
  onConfirm: (recruitment: RecruitmentRecord) => void
  deleting?: boolean
}

export default function DeleteRecruitmentDialog({
  recruitment,
  onCancel,
  onConfirm,
  deleting = false,
}: DeleteRecruitmentDialogProps) {
  if (!recruitment) return null

  return (
    <div className="admin-recruitment-dialog-backdrop" role="presentation">
      <section
        className="admin-recruitment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-recruitment-title"
      >
        <span className="admin-recruitment-dialog-icon">!</span>
        <p className="admin-room-eyebrow">US.18 · XÓA TUYỂN DỤNG</p>
        <h2 id="delete-recruitment-title">Xóa thông tin tuyển dụng?</h2>
        <p>
          Vị trí <strong>{recruitment.title}</strong> sẽ không còn xuất hiện trong
          danh sách tuyển dụng dành cho khách hàng.
        </p>
        <div className="admin-recruitment-dialog-actions">
          <button
            className="admin-secondary-button"
            type="button"
            onClick={onCancel}
            disabled={deleting}
          >
            Hủy
          </button>
          <button
            className="admin-danger-button"
            type="button"
            onClick={() => onConfirm(recruitment)}
            disabled={deleting}
          >
            {deleting ? "Đang xóa..." : "Xóa tuyển dụng"}
          </button>
        </div>
      </section>
    </div>
  )
}
