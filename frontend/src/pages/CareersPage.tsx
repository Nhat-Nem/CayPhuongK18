import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"

const careerOpenings = [
  {
    title: "Nhân viên phục vụ nhà hàng",
    type: "Toàn thời gian",
    location: "Tây Ninh",
    description:
      "Đón tiếp và phục vụ khách hàng chu đáo, phối hợp cùng đội ngũ để mang đến trải nghiệm ẩm thực ấm áp.",
  },
  {
    title: "Nhân viên buồng phòng",
    type: "Toàn thời gian",
    location: "Tây Ninh",
    description:
      "Chăm sóc không gian phòng nghỉ sạch sẽ, chỉn chu và hỗ trợ khách trong suốt thời gian lưu trú.",
  },
  {
    title: "Phụ bếp",
    type: "Toàn thời gian",
    location: "Tây Ninh",
    description:
      "Chuẩn bị nguyên liệu tươi mới, hỗ trợ bếp chính và giữ gìn tiêu chuẩn vệ sinh trong khu vực bếp.",
  },
]

export default function CareersPage() {
  return (
    <Shell>
      <Hero
        image="4451e.png"
        title="CÙNG NHAU TẠO NÊN NHỮNG TRẢI NGHIỆM ĐÁNG NHỚ"
        subtitle="Gia nhập Cây Phượng K18 và cùng chúng tôi lan tỏa sự hiếu khách chân thành giữa thiên nhiên Tây Ninh."
      />
      <section className="careers-intro">
        <div>
          <p className="eyebrow">LÀM VIỆC TẠI CÂY PHƯỢNG K18</p>
          <h2>Một đội ngũ gần gũi, cùng chung niềm tự hào địa phương</h2>
        </div>
        <p>
          Chúng tôi tìm kiếm những người yêu thích dịch vụ, trân trọng sự tử tế
          và muốn cùng nhau tạo ra trải nghiệm ấm áp cho mỗi vị khách.
        </p>
      </section>
      <section className="careers-culture">
        <div className="careers-culture-image">
          <img src={`${A}2f124.png`} alt="Đội ngũ Cây Phượng K18" />
          <span>Cùng học hỏi · Cùng sẻ chia · Cùng phát triển</span>
        </div>
        <div className="careers-values">
          {[
            ["01", "Chân thành trong phục vụ"],
            ["02", "Tôn trọng và đồng hành"],
            ["03", "Chủ động học hỏi mỗi ngày"],
          ].map(([number, title]) => (
            <div key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>
                Mỗi thành viên đều được lắng nghe, hướng dẫn và trao cơ hội để
                phát huy thế mạnh của mình.
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="careers-openings">
        <div className="careers-openings-heading">
          <div>
            <p className="eyebrow">CƠ HỘI ĐANG MỞ</p>
            <h2>Tìm vị trí dành cho bạn</h2>
          </div>
          <p>
            Chưa thấy vị trí phù hợp? Bạn vẫn có thể gửi hồ sơ để chúng tôi liên
            hệ khi có cơ hội mới.
          </p>
        </div>
        <div className="career-list">
          {careerOpenings.map((opening, index) => (
            <article key={opening.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>
                  {opening.type} · {opening.location}
                </p>
                <h3>{opening.title}</h3>
                <small>{opening.description}</small>
              </div>
              <a
                href={`mailto:cayphuongk18@gmail.com?subject=Ứng tuyển ${opening.title}`}
              >
                Ứng tuyển <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="careers-cta">
        <div>
          <p className="eyebrow">BẮT ĐẦU HÀNH TRÌNH MỚI</p>
          <h2>Gửi hồ sơ và kể chúng tôi nghe về bạn</h2>
          <p>
            Hồ sơ có thể gửi trực tiếp qua email. Đội ngũ sẽ phản hồi khi kinh
            nghiệm và mong muốn của bạn phù hợp với vị trí đang tuyển.
          </p>
        </div>
        <a href="mailto:cayphuongk18@gmail.com?subject=Ứng tuyển tại Cây Phượng K18">
          Gửi hồ sơ qua email <span>→</span>
        </a>
      </section>
    </Shell>
  )
}

