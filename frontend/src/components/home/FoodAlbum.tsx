import { useState } from "react"
import { A } from "@/config/assets"
import ButtonLink from "@/components/common/ButtonLink"

const foodAlbumPages = [
  {
    image: "f975d.png",
    label: "Đặc sản địa phương",
    title: "Cá lóc nướng muối ớt",
    text: "Cá tươi được nướng vừa lửa, lớp da thơm giòn hòa cùng vị cay mặn đậm đà và rau xanh theo mùa.",
  },
  {
    image: "122ab.png",
    label: "Món ăn gia đình",
    title: "Mâm cơm Cây Phượng",
    text: "Một mâm cơm ấm cúng với những món ăn thân quen, được chuẩn bị chỉn chu để cả gia đình cùng quây quần.",
  },
  {
    image: "49f25.png",
    label: "Món nướng",
    title: "Gà ta nướng lu",
    text: "Gà ta ướp gia vị bản địa và nướng chậm trong lu, giữ phần thịt mềm ngọt cùng lớp da vàng thơm.",
  },
  {
    image: "1eb97.png",
    label: "Đặc sản Tây Ninh",
    title: "Bánh canh Trảng Bàng",
    text: "Sợi bánh mềm dai, nước dùng trong ngọt tự nhiên, ăn kèm rau sống và gia vị đặc trưng của Tây Ninh.",
  },
  {
    image: "c32f6.png",
    label: "Món nướng",
    title: "Bò cuốn lá lốt",
    text: "Thịt bò mềm ngọt cuốn trong lá lốt thơm nồng, nướng vừa chín và dùng cùng rau sống, bánh tráng.",
  },
  {
    image: "d7106.png",
    label: "Hải sản",
    title: "Mực chiên nước mắm",
    text: "Mực tươi chiên vàng, áo lớp sốt nước mắm đậm đà với vị mặn ngọt hài hòa và hương tỏi thơm.",
  },
  {
    image: "8924c.png",
    label: "Tráng miệng",
    title: "Chè hạt sen long nhãn",
    text: "Hạt sen bùi mềm kết hợp cùng long nhãn thanh ngọt, khép lại bữa ăn bằng dư vị nhẹ nhàng, mát lành.",
  },
]

export default function FoodAlbum() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState<"next" | "previous">("next")

  const turnPage = (nextPage: number, nextDirection: "next" | "previous") => {
    setDirection(nextDirection)
    setPage((nextPage + foodAlbumPages.length) % foodAlbumPages.length)
  }

  const current = foodAlbumPages[page]
  const next = foodAlbumPages[(page + 1) % foodAlbumPages.length]

  return (
    <section id="trai-nghiem" className="section food-album-section">
      <div className="food-album-heading home-title-reveal">
        <div>
          <p className="eyebrow">ẨM THỰC</p>
          <h2>Hương vị trong từng trang</h2>
        </div>
        <p>
          Lật mở cuốn album ẩm thực và khám phá những món ăn mang hương vị gần
          gũi, tươi ngon của Cây Phượng K18.
        </p>
      </div>

      <div className="food-album">
        <button
          className="album-arrow album-arrow-previous"
          onClick={() => turnPage(page - 1, "previous")}
          aria-label="Lật về trang trước"
        >
          ←
        </button>
        <div
          className={`album-spread album-turn-${direction}`}
          key={`${page}-${direction}`}
        >
          <article className="album-page album-page-left">
            <span className="album-page-number">
              {String(page + 1).padStart(2, "0")}
            </span>
            <img src={`${A}${current.image}`} alt={current.title} />
            <div className="album-photo-caption">
              <span>{current.label}</span>
              <strong>{current.title}</strong>
            </div>
          </article>
          <article className="album-page album-page-right">
            <div className="album-page-copy">
              <span className="script">Thưởng thức</span>
              <p className="eyebrow">{current.label}</p>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
              <ButtonLink href="/menu">Khám phá thực đơn</ButtonLink>
            </div>
            <div className="album-next-preview">
              <img src={`${A}${next.image}`} alt="" />
              <span>Trang tiếp theo · {next.title}</span>
            </div>
          </article>
        </div>
        <button
          className="album-arrow album-arrow-next"
          onClick={() => turnPage(page + 1, "next")}
          aria-label="Lật sang trang tiếp theo"
        >
          →
        </button>
      </div>
    </section>
  )
}

