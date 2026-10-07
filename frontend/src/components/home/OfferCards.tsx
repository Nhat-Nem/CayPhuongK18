import { useState } from "react"
import { A } from "@/config/assets"
import { offers } from "@/data/offers"

export default function OfferCards() {
  const [position, setPosition] = useState(0)
  const shown = [...offers.slice(position), ...offers.slice(0, position)]
  return (
    <div className="carousel">
      <button
        onClick={() =>
          setPosition((position + offers.length - 1) % offers.length)
        }
        aria-label="Ưu đãi trước"
      >
        ←
      </button>
      <div className="card-grid offer-grid">
        {shown.map((offer) => (
          <article className="card" key={offer.title}>
            <img src={`${A}${offer.image}`} alt="" />
            <div className="card-body">
              <small>Ưu đãi</small>
              <h3>{offer.title}</h3>
              <p>{offer.text}</p>
              <a href="/uu-dai/chi-tiet">Tìm hiểu thêm »</a>
            </div>
          </article>
        ))}
      </div>
      <button
        onClick={() => setPosition((position + 1) % offers.length)}
        aria-label="Ưu đãi tiếp theo"
      >
        →
      </button>
    </div>
  )
}

