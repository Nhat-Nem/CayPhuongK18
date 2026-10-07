import footerLogoImg from "@/imports/footer-logo.png"
import { A } from "@/config/assets"
import { routes } from "@/config/routes"

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-logo-wrap" href="/" aria-label="Về trang chủ">
            <img
              className="footer-logo"
              src={footerLogoImg}
              alt="Cây Phượng K18"
            />
          </a>
          <div>
            <h2>CÂY PHƯỢNG K18</h2>
            <p>Homestay &amp; Nhà hàng</p>
            <span>
              Một điểm đến bình yên cho kỳ nghỉ và những bữa ăn đáng nhớ.
            </span>
          </div>
        </div>
        <div className="footer-column">
          <h3>Khám phá</h3>
          <a href="/phong">Phòng nghỉ</a>
          <a href="/menu">Thực đơn</a>
          <a href="/uu-dai">Ưu đãi</a>
        </div>
        <div className="footer-column">
          <h3>Thông tin</h3>
          <a href="/ve-chung-toi">Về chúng tôi</a>
          <a href="/tuyen-dung">Tuyển dụng</a>
          <a href="/lien-he">Liên hệ</a>
          <a href="#faq">Câu hỏi thường gặp</a>
          <a href={routes.adminLogin}>Đăng nhập Admin</a>
        </div>
        <div className="footer-contact">
          <h3>Liên hệ</h3>
          <p>Tây Ninh, Việt Nam</p>
          <a href="tel:0123456789">0123 456 789</a>
          <a href="mailto:mail@gmail.com">mail@gmail.com</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© Cây Phượng K18. Tất cả quyền được bảo lưu.</p>
        <div className="footer-social">
          <span>Theo dõi chúng tôi</span>
          <a href="#facebook" aria-label="Facebook">
            <img src={`${A}46b0b.svg`} alt="" />
          </a>
          <a href="#instagram" aria-label="Instagram">
            <img src={`${A}8044e.svg`} alt="" />
          </a>
          <a href="#whatsapp" aria-label="WhatsApp">
            <img src={`${A}cc92b.svg`} alt="" />
          </a>
          <a href="#zalo" aria-label="Zalo">
            <img src={`${A}9d481.svg`} alt="" />
          </a>
        </div>
      </div>
    </footer>
  )
}

