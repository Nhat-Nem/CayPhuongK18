import { useEffect, useState } from "react"
import { resolveImageSource } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { formatRoomPrice, type RoomPrototype } from "@/data/roomPrototype"
import { getRoomById } from "@/services/roomApi"

export default function RoomDetailPage() {
  const roomId = new URLSearchParams(window.location.search).get("id")
  const [room, setRoom] = useState<RoomPrototype | null>(null)
  const [active, setActive] = useState(0)
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
        setActive(0)
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

  const gallery = Array.from(
    new Set(room.images.filter((image) => Boolean(image))),
  ).slice(0, 5)

  const galleryLength = gallery.length
  const safeActive =
    galleryLength > 0
      ? ((active % galleryLength) + galleryLength) % galleryLength
      : 0

  // Carousel giữ bố cục prototype: tối đa 3 ảnh lớn cùng lúc.
  // Toàn bộ tối đa 5 ảnh vẫn luôn xuất hiện ở dải thumbnail phía dưới
  // và đều có thể duyệt bằng hai mũi tên trái/phải.
  const visibleIndexes =
    galleryLength >= 3
      ? [
          (safeActive + galleryLength - 1) % galleryLength,
          safeActive,
          (safeActive + 1) % galleryLength,
        ]
      : Array.from({ length: galleryLength }, (_, index) => index)

  const previousImage = () => {
    if (galleryLength <= 1) return

    setActive(
      (current) =>
        (current + galleryLength - 1) % galleryLength,
    )
  }

  const nextImage = () => {
    if (galleryLength <= 1) return

    setActive((current) => (current + 1) % galleryLength)
  }

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

            {gallery[0] && (
              <img
                src={resolveImageSource(gallery[0])}
                alt={`${room.name} - ảnh chính`}
              />
            )}
          </div>

          <div>
            {gallery[1] && (
              <img
                src={resolveImageSource(gallery[1])}
                alt={`${room.name} - ảnh phụ 1`}
              />
            )}

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

        {galleryLength > 0 && (
          <section
            className="detail-gallery-section"
            aria-label={`Thư viện ảnh ${room.name}`}
          >
            <div
              className={`detail-gallery detail-gallery-count-${Math.min(
                galleryLength,
                3,
              )}`}
            >
              <button
                type="button"
                onClick={previousImage}
                disabled={galleryLength <= 1}
                aria-label="Xem ảnh trước"
              >
                ‹
              </button>

              {visibleIndexes.map((imageIndex) => (
                <img
                  className={imageIndex === safeActive ? "active" : ""}
                  onClick={() => setActive(imageIndex)}
                  src={resolveImageSource(gallery[imageIndex])}
                  alt={`${room.name} - ảnh ${imageIndex + 1}`}
                  key={`${gallery[imageIndex]}-${imageIndex}`}
                />
              ))}

              <button
                type="button"
                onClick={nextImage}
                disabled={galleryLength <= 1}
                aria-label="Xem ảnh tiếp theo"
              >
                ›
              </button>
            </div>

            <div className="detail-gallery-all">
              {gallery.map((image, index) => (
                <button
                  type="button"
                  className={index === safeActive ? "active" : ""}
                  onClick={() => setActive(index)}
                  aria-label={`Chọn ảnh ${index + 1}`}
                  key={`thumb-${image}-${index}`}
                >
                  <img
                    src={resolveImageSource(image)}
                    alt={`${room.name} - ảnh nhỏ ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </article>
    </Shell>
  )
}
