import { useEffect, useMemo, useState } from "react"
import AdminRoomLayout from "@/components/admin/AdminRoomLayout"
import DeleteRoomDialog from "@/components/admin/DeleteRoomDialog"
import { resolveImageSource } from "@/config/assets"
import { routes } from "@/config/routes"
import {
  formatRoomPrice,
  getRoomStatusLabel,
  type RoomPrototype,
  type RoomStatus,
} from "@/data/roomPrototype"
import { deleteRoom, getRooms } from "@/services/roomApi"

function initialNotice() {
  const saved = new URLSearchParams(window.location.search).get("saved")
  if (saved === "created") return "Đã thêm phòng mới vào database."
  if (saved === "updated") return "Đã cập nhật thông tin phòng trong database."
  return ""
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<RoomPrototype[]>([])
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"ALL" | RoomStatus>("ALL")
  const [roomToDelete, setRoomToDelete] = useState<RoomPrototype | null>(null)
  const [notice, setNotice] = useState(initialNotice)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRooms = async () => {
    setLoading(true)
    try {
      setRooms(await getRooms())
      setError("")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách phòng",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRooms()
  }, [])

  const filteredRooms = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("vi")
    return rooms.filter((room) => {
      const matchesStatus = status === "ALL" || room.status === status
      const matchesKeyword =
        !keyword ||
        [room.code, room.name, room.type]
          .join(" ")
          .toLocaleLowerCase("vi")
          .includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [query, rooms, status])

  const confirmDelete = async (room: RoomPrototype) => {
    try {
      await deleteRoom(room.id)
      setRoomToDelete(null)
      setNotice(`Đã xóa ${room.code} khỏi database.`)
      await loadRooms()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa phòng")
    }
  }

  return (
    <AdminRoomLayout
      title="Danh sách phòng"
      subtitle="US.02 · Dữ liệu phòng lấy từ GET /api/v1/rooms. Trạng thái backend dùng AVAILABLE / UNAVAILABLE."
      primaryAction={
        <a className="admin-primary-button" href={routes.adminRoomCreate}>
          + Thêm phòng
        </a>
      }
    >
      <section className="admin-room-stats" aria-label="Tổng quan phòng">
        <article>
          <span>Tổng số phòng</span>
          <strong>{rooms.length}</strong>
          <small>Trong database</small>
        </article>
        <article>
          <span>Đang hoạt động</span>
          <strong>
            {rooms.filter((room) => room.status === "AVAILABLE").length}
          </strong>
          <small>Hiển thị cho khách</small>
        </article>
        <article>
          <span>Tạm ngưng</span>
          <strong>
            {rooms.filter((room) => room.status === "UNAVAILABLE").length}
          </strong>
          <small>Ẩn khỏi trang khách</small>
        </article>
      </section>

      <section className="admin-room-panel">
        <div className="admin-room-toolbar">
          <label className="admin-room-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Tìm kiếm phòng"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo mã, tên, loại phòng..."
            />
          </label>

          <select
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "ALL" | RoomStatus)
            }
          >
            <option value="ALL">Tất cả</option>
            <option value="AVAILABLE">{getRoomStatusLabel("AVAILABLE")}</option>
            <option value="UNAVAILABLE">
              {getRoomStatusLabel("UNAVAILABLE")}
            </option>
          </select>

          <span className="admin-room-result-count">
            {filteredRooms.length} kết quả
          </span>
        </div>

        {notice && (
          <div className="admin-room-inline-notice">
            <span>✓</span>
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        )}

        {error && <div className="admin-room-form-notice error">⚠ {error}</div>}

        {loading && (
          <div className="admin-room-empty">
            <strong>Đang tải dữ liệu...</strong>
          </div>
        )}

        {!loading && (
          <div className="admin-room-table-wrap">
            <table className="admin-room-table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Loại</th>
                  <th>Giá / đêm</th>
                  <th>Sức chứa</th>
                  <th>Trạng thái</th>
                  <th aria-label="Thao tác" />
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <div className="admin-room-cell">
                        <img
                          src={resolveImageSource(room.images[0])}
                          alt=""
                        />
                        <div>
                          <strong>{room.name}</strong>
                          <span>{room.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>{room.type}</td>
                    <td>
                      <strong>{formatRoomPrice(room.price)}</strong>
                    </td>
                    <td>{room.capacity} khách</td>
                    <td>
                      <span
                        className={`admin-room-status ${
                          room.status === "AVAILABLE" ? "active" : "paused"
                        }`}
                      >
                        {getRoomStatusLabel(room.status)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-room-row-actions">
                        <a
                          className="admin-icon-button"
                          href={`${routes.adminRoomEdit}?id=${room.id}`}
                          aria-label={`Sửa ${room.name}`}
                          title="Sửa phòng"
                        >
                          ✎
                        </a>
                        <button
                          className="admin-icon-button danger"
                          type="button"
                          onClick={() => setRoomToDelete(room)}
                          aria-label={`Xóa ${room.name}`}
                          title="Xóa phòng"
                        >
                          ⌫
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredRooms.length === 0 && (
          <div className="admin-room-empty">
            <strong>Không tìm thấy phòng phù hợp</strong>
            <span>Hãy đổi từ khóa hoặc bộ lọc trạng thái.</span>
          </div>
        )}
      </section>

      <DeleteRoomDialog
        room={roomToDelete}
        onCancel={() => setRoomToDelete(null)}
        onConfirm={(room) => void confirmDelete(room)}
      />
    </AdminRoomLayout>
  )
}
