import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import MenuTabs from "@/components/menu/MenuTabs"

export default function MenuPage() {
  return (
    <Shell>
      <Hero
        image="06f7b.png"
        title="ẨM THỰC"
        subtitle="Cây Phượng K18 là điểm hẹn dành cho những bữa ăn ngon — nơi đặc sản Tây Ninh, nguyên liệu tươi mới và niềm vui quây quần luôn là trải nghiệm trung tâm."
      />
      <section className="menu-identity">
        <div className="menu-identity-image">
          <img src={`${A}122ab.png`} alt="Mâm cơm tại Cây Phượng K18" />
          <span>Hương vị Tây Ninh · Phục vụ mỗi ngày</span>
        </div>
        <div className="menu-identity-copy">
          <p className="eyebrow">TRẢI NGHIỆM CHÍNH TẠI CÂY PHƯỢNG K18</p>
          <span className="script">Đến đây là để ăn ngon</span>
          <h2>Một quán ăn được tạo nên từ hương vị và sự quây quần</h2>
          <p>
            Từ món đặc sản địa phương đến những mâm cơm gia đình, căn bếp Cây
            Phượng K18 tập trung vào nguyên liệu tươi, cách nấu gần gũi và cảm
            giác ấm cúng trong từng bữa ăn.
          </p>
          <div className="menu-identity-facts">
            <div>
              <strong>20+</strong>
              <span>Món ăn chọn lọc</span>
            </div>
            <div>
              <strong>Mỗi ngày</strong>
              <span>Nguyên liệu tươi mới</span>
            </div>
            <div>
              <strong>Tây Ninh</strong>
              <span>Hương vị địa phương</span>
            </div>
          </div>
        </div>
      </section>
      <section className="section menu-section">
        <div className="menu-heading">
          <div>
            <p className="eyebrow">THỰC ĐƠN CÂY PHƯỢNG K18</p>
            <h2>
              Chọn một món ngon,
              <br />
              bắt đầu một cuộc vui
            </h2>
          </div>
          <div className="menu-intro">
            <p>
              Thực đơn là trung tâm của trải nghiệm Cây Phượng K18, được chuẩn
              bị cho những bữa ăn gia đình, buổi gặp gỡ bạn bè và các dịp sum
              họp đáng nhớ.
            </p>
            <div className="menu-promises">
              <span>Nguyên liệu tươi mỗi ngày</span>
              <span>Đậm vị địa phương</span>
            </div>
          </div>
        </div>
        <MenuTabs />
      </section>
    </Shell>
  )
}

