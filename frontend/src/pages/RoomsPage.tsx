import { useEffect, useState } from "react"
import { resolveImageSource } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import ButtonLink from "@/components/common/ButtonLink"
import { formatRoomPrice, type RoomPrototype } from "@/data/roomPrototype"
import { getPublicRooms } from "@/services/roomApi"

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomPrototype[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getPublicRooms()
      .then(setRooms)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Shell>
      <Hero
        image="e4fc5.png"
        title="HẠNG PHÒNG"
        subtitle="Nơi không gian mộc mạc hòa quyện cùng thiên nhiên, mang lại giấc ngủ bình yên và trải nghiệm nghỉ dưỡng ấm áp."
      />

      <div className="room-list">
        {loading && (
          <section className="section centered">
            <h2>Đang tải danh sách phòng...</h2>
          </section>
        )}

        {error && (
          <section className="section centered">
            <h2>Không thể tải dữ liệu phòng</h2>
            <p>{error}</p>
          </section>
        )}

        {!loading &&
          !error &&
          rooms.map((room, index) => (
            <section
              className={`room-row ${index % 2 ? "reverse" : ""}`}
              key={room.id}
            >
              <div className="room-photos">
                <img
                  src={resolveImageSource(room.images[0])}
                  alt={room.name}
                />
                <img src={resolveImageSource(room.images[1])} alt="" />
              </div>

              <div className="room-copy">
                <p className="room-index">
                  {room.type.toUpperCase()} · {room.code}
                </p>
                <h2>{room.name}</h2>
                <p className="room-description">{room.description}</p>
                <p className="room-price-preview">
                  <span>Từ</span>
                  <strong>{formatRoomPrice(room.price)}</strong>
                  <small>/ đêm</small>
                </p>

                <div className="room-facts">
                  <div>
                    <span>Sức chứa</span>
                    <strong>{room.capacity} khách</strong>
                  </div>
                  <div>
                    <span>Loại phòng</span>
                    <strong>{room.type}</strong>
                  </div>
                </div>

                <div className="room-highlights">
                  <span>Wi-Fi miễn phí</span>
                  <span>Phòng tắm riêng</span>
                  <span>Không gian nghỉ dưỡng</span>
                </div>

                <div className="room-actions">
                  <ButtonLink href={`/phong/chi-tiet?id=${room.id}`}>
                    Xem chi tiết
                  </ButtonLink>
                  <a
                    className="room-booking-link"
                    href={`/dat-phong?room=${room.id}`}
                  >
                    Đặt phòng <span>→</span>
                  </a>
                </div>
              </div>
            </section>
          ))}

        {!loading && !error && rooms.length === 0 && (
          <section className="section centered">
            <h2>Hiện chưa có phòng đang hoạt động</h2>
            <p>
              Vui lòng quay lại sau hoặc liên hệ Cây Phượng K18 để được hỗ trợ.
            </p>
          </section>
        )}
      </div>
    </Shell>
  )
}
