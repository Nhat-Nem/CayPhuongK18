import type { RoomPrototype } from "@/data/roomPrototype"

interface DeleteRoomDialogProps {
  room: RoomPrototype | null
  error?: string
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: (room: RoomPrototype) => void
}

export default function DeleteRoomDialog({
  room,
  error = "",
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteRoomDialogProps) {
  if (!room) return null

  return (
    <div
      className="admin-room-modal-backdrop"
      role="presentation"
      onMouseDown={() => {
        if (!isDeleting) onCancel()
      }}
    >
      <section
        aria-labelledby="delete-room-title"
        aria-modal="true"
        className="admin-room-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-room-modal-icon" aria-hidden="true">
          !
        </div>
        <p className="admin-room-eyebrow">XÓA PHÒNG</p>
        <h2 id="delete-room-title">Xóa phòng này?</h2>
        <p>
          Bạn đang chọn xóa <strong>{room.name}</strong> ({room.code}). Nếu
          phòng đã phát sinh lượt lưu trú, hệ thống có thể từ chối xóa để bảo
          toàn lịch sử dữ liệu.
        </p>

        {error && (
          <div className="admin-room-form-notice error" role="alert" aria-live="polite">
            ⚠ {error}
          </div>
        )}

        <div className="admin-room-modal-actions">
          <button
            className="admin-secondary-button"
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Hủy
          </button>
          <button
            className="admin-danger-button"
            type="button"
            onClick={() => onConfirm(room)}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </section>
    </div>
  )
}
