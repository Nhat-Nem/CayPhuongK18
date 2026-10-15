import { useEffect, useState } from "react"
import { resolveImageSource } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { formatRoomPrice, type RoomPrototype } from "@/data/roomPrototype"
import { getRoomById } from "@/services/roomApi"

export default function RoomDetailPage() {
  const roomId = new URLSearchParams(window.location.search).get("id")
  const [room, setRoom] = useState<RoomPrototype | null>(null)
  const [active, setActive] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!roomId) {
      setError("Thiếu mã phòng.")
      setLoading(false)
      return
    }

    getRoomById(roomId)
      .then((data) => {
        if (data.status !== "AVAILABLE") {
          throw new Error("Phòng hiện không được mở bán.")
        }
        setRoom(data)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [roomId])

  if (loading) {
    return (
      <Shell>
        <Hero image="06f7b.png" title="HẠNG PHÒNG" />
        <section className="section centered">
          <h2>Đang tải thông tin phòng...</h2>
        </section>
      </Shell>
    )
  }

  if (!room || error) {
    return (
      <Shell>
        <Hero image="06f7b.png" title="HẠNG PHÒNG" />
        <section className="section centered">
          <h2>Không tìm thấy phòng</h2>
          <p>{error}</p>
          <a className="button-link" href="/phong">
            Quay lại danh sách phòng
          </a>
        </section>
      </Shell>
    )
  }

  const gallery = [room.images[0], room.images[1], "87e80.png"]

  return (
    <Shell>
      <Hero
        image="06f7b.png"
        title="HẠNG PHÒNG"
        subtitle="Nơi không gian mộc mạc hòa quyện cùng thiên nhiên, mang lại giấc ngủ bình yên và trải nghiệm nghỉ dưỡng ấm áp."
      />

      <article className="section sage room-detail">
        <header className="room-detail-header">
          <div>
            <p className="room-index">
              {room.type.toUpperCase()} · {room.code}
            </p>
            <h2>{room.name}</h2>
            <p>{room.description}</p>
            <p className="room-detail-price">
              <strong>{formatRoomPrice(room.price)}</strong>
              <span>/ đêm</span>
            </p>
          </div>

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
        </header>

        <div className="detail-columns">
          <div>
            <h3>Không gian phòng</h3>
            <p>
              Trải nghiệm nghỉ dưỡng tại HomeStay Cây Phượng với không gian gần
              gũi thiên nhiên, nội thất ấm cúng và các tiện nghi cần thiết cho kỳ
              nghỉ thoải mái.
            </p>
            <img src={resolveImageSource(room.images[0])} alt={room.name} />
          </div>

          <div>
            <img
              src={resolveImageSource(room.images[1])}
              alt={`Không gian ${room.name}`}
            />
            <div className="amenity-panel">
              <h3>Tiện nghi trong phòng</h3>
              <ul>
                <li>Sức chứa tối đa {room.capacity} khách</li>
                <li>TV màn hình phẳng</li>
                <li>Wi-Fi tốc độ cao</li>
                <li>Phòng tắm riêng, vòi sen</li>
                <li>Trà và cà phê miễn phí</li>
              </ul>
              <a
                className="room-booking-link"
                href={`/dat-phong?room=${room.id}`}
              >
                Liên hệ đặt phòng <span>→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="detail-gallery">
          <button
            onClick={() =>
              setActive((active + gallery.length - 1) % gallery.length)
            }
          >
            ‹
          </button>
          {gallery.map((image, i) => (
            <img
              className={i === active ? "active" : ""}
              onClick={() => setActive(i)}
              src={resolveImageSource(image)}
              alt=""
              key={`${image}-${i}`}
            />
          ))}
          <button
            onClick={() => setActive((active + 1) % gallery.length)}
          >
            ›
          </button>
        </div>
      </article>
    </Shell>
  )
}
