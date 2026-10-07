import type { RoomPrototype } from "@/data/roomPrototype"

interface DeleteRoomDialogProps {
  room: RoomPrototype | null
  onCancel: () => void
  onConfirm: (room: RoomPrototype) => void
}

export default function DeleteRoomDialog({
  room,
  onCancel,
  onConfirm,
}: DeleteRoomDialogProps) {
  if (!room) return null

  return (
    <div className="admin-room-modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        aria-labelledby="delete-room-title"
        aria-modal="true"
        className="admin-room-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-room-modal-icon" aria-hidden="true">!</div>
        <p className="admin-room-eyebrow">T.17 · US.05</p>
        <h2 id="delete-room-title">Xóa phòng này?</h2>
        <p>
          Bạn đang chọn xóa <strong>{room.name}</strong> ({room.code}). Thao tác
          prototype này chỉ xóa dữ liệu tạm trên giao diện và chưa gọi API.
        </p>
        <div className="admin-room-modal-actions">
          <button className="admin-secondary-button" type="button" onClick={onCancel}>
            Hủy
          </button>
          <button className="admin-danger-button" type="button" onClick={() => onConfirm(room)}>
            Xác nhận xóa
          </button>
        </div>
      </section>
    </div>
  )
}
