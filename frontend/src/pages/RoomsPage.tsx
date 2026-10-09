import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import ButtonLink from "@/components/common/ButtonLink"
import { formatRoomPrice } from "@/data/roomPrototype"
import { getPublicRooms } from "@/utils/roomStore"

export default function RoomsPage() {
  const rooms = getPublicRooms()

  return (
    <Shell>
      <Hero image="e4fc5.png" title="HẠNG PHÒNG" subtitle="Nơi không gian mộc mạc hòa quyện cùng thiên nhiên, mang lại giấc ngủ bình yên và trải nghiệm nghỉ dưỡng ấm áp." />
      <div className="room-list">
        {rooms.map((room, index) => (
          <section className={`room-row ${index % 2 ? "reverse" : ""}`} key={room.id}>
            <div className="room-photos"><img src={`${A}${room.images[0]}`} alt={room.name} /><img src={`${A}${room.images[1]}`} alt="" /></div>
            <div className="room-copy">
              <p className="room-index">{room.type.toUpperCase()} · {room.code}</p>
              <h2>{room.name}</h2>
              <p className="room-description">{room.description}</p>
              <p className="room-price-preview"><span>Từ</span><strong>{formatRoomPrice(room.price)}</strong><small>/ đêm</small></p>
              <div className="room-facts"><div><span>Sức chứa</span><strong>{room.capacity} khách</strong></div><div><span>Giường</span><strong>{room.bed}</strong></div><div><span>Tầm nhìn</span><strong>{room.view}</strong></div></div>
              <div className="room-highlights"><span>Ban công riêng</span><span>Wi-Fi miễn phí</span><span>Phòng tắm riêng</span></div>
              <div className="room-actions">
                <ButtonLink href={`/phong/chi-tiet?id=${encodeURIComponent(room.id)}`}>Xem chi tiết</ButtonLink>
                <a className="room-booking-link" href={`/dat-phong?room=${encodeURIComponent(room.id)}`}>Đặt phòng <span>→</span></a>
              </div>
            </div>
          </section>
        ))}
        {rooms.length === 0 && <section className="section centered"><h2>Hiện chưa có phòng đang hoạt động</h2><p>Vui lòng quay lại sau hoặc liên hệ Cây Phượng K18 để được hỗ trợ.</p></section>}
      </div>
    </Shell>
  )
}
