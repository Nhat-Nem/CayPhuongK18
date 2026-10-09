import { useState } from "react"
import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { formatRoomPrice } from "@/data/roomPrototype"
import { getPublicRooms, getRoomById } from "@/utils/roomStore"

export default function RoomDetailPage() {
  const roomId = new URLSearchParams(window.location.search).get("id")
  const requestedRoom = getRoomById(roomId)
  const room = requestedRoom?.status === "Đang hoạt động" ? requestedRoom : getPublicRooms()[0]
  const [active, setActive] = useState(1)

  if (!room) {
    return <Shell><Hero image="06f7b.png" title="HẠNG PHÒNG" /><section className="section centered"><h2>Không tìm thấy phòng</h2><a className="button-link" href="/phong">Quay lại danh sách phòng</a></section></Shell>
  }

  const gallery = [room.images[0], room.images[1], "87e80.png"]

  return (
    <Shell>
      <Hero image="06f7b.png" title="HẠNG PHÒNG" subtitle="Nơi không gian mộc mạc hòa quyện cùng thiên nhiên, mang lại giấc ngủ bình yên và trải nghiệm nghỉ dưỡng ấm áp." />
      <article className="section sage room-detail">
        <header className="room-detail-header">
          <div><p className="room-index">{room.type.toUpperCase()} · {room.code}</p><h2>{room.name}</h2><p>{room.description}</p><p className="room-detail-price"><strong>{formatRoomPrice(room.price)}</strong><span>/ đêm</span></p></div>
          <div className="room-facts"><div><span>Sức chứa</span><strong>{room.capacity} khách</strong></div><div><span>Giường</span><strong>{room.bed}</strong></div><div><span>Tầm nhìn</span><strong>{room.view}</strong></div></div>
        </header>
        <div className="detail-columns">
          <div><h3>Không gian phòng</h3><p>Trải nghiệm nghỉ dưỡng tại HomeStay Cây Phượng với không gian gần gũi thiên nhiên, nội thất ấm cúng và các tiện nghi cần thiết cho kỳ nghỉ thoải mái.</p><img src={`${A}${room.images[0]}`} alt={room.name} /></div>
          <div><img src={`${A}${room.images[1]}`} alt={`Không gian ${room.name}`} /><div className="amenity-panel"><h3>Tiện nghi trong phòng</h3><ul><li>{room.bed} êm ái</li><li>{room.view}</li><li>TV màn hình phẳng</li><li>Wi-Fi tốc độ cao</li><li>Phòng tắm riêng, vòi sen</li><li>Trà và cà phê miễn phí</li></ul><a className="room-booking-link" href={`/dat-phong?room=${encodeURIComponent(room.id)}`}>Liên hệ đặt phòng <span>→</span></a></div></div>
        </div>
        <div className="detail-gallery">
          <button onClick={() => setActive((active + gallery.length - 1) % gallery.length)}>‹</button>
          {gallery.map((image, i) => <img className={i === active ? "active" : ""} onClick={() => setActive(i)} src={`${A}${image}`} alt="" key={`${image}-${i}`} />)}
          <button onClick={() => setActive((active + 1) % gallery.length)}>›</button>
        </div>
      </article>
    </Shell>
  )
}
