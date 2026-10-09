import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import ButtonLink from "@/components/common/ButtonLink"

export default function AboutPage() {
  return (
    <Shell>
      <Hero
        image="1277f.png"
        title="CÂU CHUYỆN CÂY PHƯỢNG K18"
        subtitle="Một nơi chốn được vun đắp từ tình yêu dành cho thiên nhiên, ẩm thực Tây Ninh và những cuộc gặp gỡ chân thành."
      />

      <section className="story-opening">
        <div className="story-opening-image">
          <img src={`${A}e9e73.png`} alt="Cây Phượng K18 giữa thiên nhiên" />
          <span>
            <strong>K18</strong>
            Tây Ninh
          </span>
        </div>
        <div className="story-opening-copy">
          <p className="eyebrow">KHỞI NGUỒN CÂU CHUYỆN</p>
          <span className="script">Nơi bình yên bắt đầu</span>
          <h2>Từ một bóng cây, thành một nơi để trở về</h2>
          <p>
            Cây Phượng K18 bắt đầu từ mong muốn tạo nên một điểm dừng chân mộc
            mạc giữa thiên nhiên Tây Ninh — nơi mọi người có thể chậm lại, dùng
            một bữa cơm ngon và ngủ một giấc thật yên.
          </p>
          <p>
            Chúng tôi giữ lại vẻ gần gũi của vật liệu gỗ, khu vườn xanh và những
            món ăn thân quen. Mỗi góc nhỏ đều được chăm chút để khi ghé thăm,
            bạn không chỉ là một vị khách mà còn là người bạn của ngôi nhà.
          </p>
          <blockquote>
            “Sự hiếu khách chân thành luôn bắt đầu từ những điều giản dị.”
          </blockquote>
        </div>
      </section>

      <section className="story-journey">
        <div className="story-section-heading">
          <p className="eyebrow">HÀNH TRÌNH CỦA CHÚNG TÔI</p>
          <h2>Ba điều làm nên Cây Phượng K18</h2>
        </div>
        <div className="story-steps">
          {[
            [
              "01",
              "Gìn giữ nét mộc",
              "Tôn trọng cảnh quan, vật liệu tự nhiên và nhịp sống yên bình vốn có của vùng đất Tây Ninh.",
            ],
            [
              "02",
              "Nấu bằng sự chân thành",
              "Chọn nguyên liệu tươi mới, nêm nếm hương vị gần gũi và phục vụ như một bữa cơm nhà.",
            ],
            [
              "03",
              "Đón bạn như người thân",
              "Chăm chút từng căn phòng, bữa ăn và lời chào để mỗi chuyến ghé thăm đều thật đáng nhớ.",
            ],
          ].map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="story-experiences">
        <div className="story-experience-card">
          <img src={`${A}d8971.png`} alt="Không gian lưu trú gần thiên nhiên" />
          <div>
            <span>01 · PHÒNG</span>
            <h2>Một giấc ngủ giữa thiên nhiên</h2>
            <p>
              Những căn phòng gỗ ấm áp mở ra khoảng xanh bình yên, dành cho
              những ngày bạn muốn tạm rời nhịp sống vội vàng.
            </p>
            <ButtonLink href="/phong">Khám phá phòng</ButtonLink>
          </div>
        </div>
        <div className="story-experience-card reverse">
          <img src={`${A}17a11.png`} alt="Ẩm thực địa phương Tây Ninh" />
          <div>
            <span>02 · ẨM THỰC</span>
            <h2>Một bữa ăn kể chuyện vùng đất</h2>
            <p>
              Hương vị Tây Ninh hiện diện qua nguyên liệu địa phương, cách nấu
              thân thuộc và niềm vui của những bữa ăn quây quần.
            </p>
            <ButtonLink href="/menu">Khám phá thực đơn</ButtonLink>
          </div>
        </div>
      </section>

      <section className="story-closing">
        <img src={`${A}4451e.png`} alt="Phong cảnh bình yên tại Tây Ninh" />
        <div>
          <p className="eyebrow">LỜI HẸN TỪ CÂY PHƯỢNG</p>
          <h2>Chúng tôi luôn dành sẵn cho bạn một chỗ ngồi</h2>
          <p>
            Dù bạn đến để nghỉ một đêm, dùng một bữa cơm hay chỉ ghé qua ngắm
            cảnh, Cây Phượng K18 mong được đón bạn bằng sự chân thành nguyên vẹn.
          </p>
          <ButtonLink href="/lien-he">Ghé thăm chúng tôi</ButtonLink>
        </div>
      </section>
    </Shell>
  )
}

