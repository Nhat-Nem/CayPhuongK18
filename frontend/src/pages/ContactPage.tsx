import { useEffect, useState } from "react"
import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { CONTACT_UPDATED_EVENT, getContactSettings, getPhoneHref, normalizeContactHref } from "@/utils/contactStore"

export default function ContactPage() {
  const [contact, setContact] = useState(getContactSettings)
  const [sent, setSent] = useState(false)
  const [rating, setRating] = useState(0)
  useEffect(() => {
    const refresh = () => setContact(getContactSettings())
    window.addEventListener("storage", refresh)
    window.addEventListener(CONTACT_UPDATED_EVENT, refresh)
    return () => {
      window.removeEventListener("storage", refresh)
      window.removeEventListener(CONTACT_UPDATED_EVENT, refresh)
    }
  }, [])

  const requestTypes = ["Đặt phòng", "Đặt bàn", "Feedback"] as const
  const [requestType, setRequestType] = useState<typeof requestTypes[number]>(
    () =>
      new URLSearchParams(window.location.search).get("type") === "table"
        ? "Đặt bàn"
        : "Đặt phòng",
  )
  const requestContent = {
    "Đặt phòng": {
      title: "Yêu cầu đặt phòng",
      description:
        "Hãy để lại thông tin và nhu cầu lưu trú. Chúng tôi sẽ liên hệ xác nhận phòng phù hợp trong thời gian sớm nhất.",
      placeholder:
        "Ví dụ: Ngày nhận phòng, ngày trả phòng, số lượng khách và yêu cầu đặc biệt...",
      button: "Gửi yêu cầu đặt phòng",
    },
    "Đặt bàn": {
      title: "Yêu cầu đặt bàn",
      description:
        "Chia sẻ thời gian, số lượng khách và mong muốn của bạn để chúng tôi chuẩn bị bàn chu đáo.",
      placeholder:
        "Ví dụ: Ngày giờ dùng bữa, số lượng khách, vị trí bàn hoặc món ăn quan tâm...",
      button: "Gửi yêu cầu đặt bàn",
    },
    Feedback: {
      title: "Gửi feedback",
      description:
        "Mọi góp ý của bạn đều giúp Cây Phượng K18 cải thiện trải nghiệm và phục vụ tốt hơn.",
      placeholder:
        "Chia sẻ cảm nhận, góp ý hoặc trải nghiệm của bạn tại Cây Phượng K18...",
      button: "Gửi feedback",
    },
  }[requestType]!
  return (
    <Shell>
      <Hero image="8e9ad.png" title="Thông tin liên hệ" />
      <section className="contact-overview">
        <div className="contact-overview-heading">
          <div>
            <p className="eyebrow">THÔNG TIN LIÊN HỆ</p>
            <h2>
              Kết nối với
              <br />
              Cây Phượng K18
            </h2>
          </div>
          <p>
            Mọi thắc mắc vui lòng liên hệ với chúng tôi qua đường dây nóng hoặc
            email. Đội ngũ sẽ phản hồi trong vòng 24 giờ.
          </p>
        </div>
        <div className="contact-info">
          <div className="contact-details">
            <article className="contact-method">
              <div className="contact-icon">
                <img src={`${A}f995f.png`} alt="" />
              </div>
              <div>
                <span>Hotline</span>
                <a href={getPhoneHref(contact.hotline)}>{contact.hotline}</a>
                <small>Hỗ trợ hằng ngày · 07:00–22:00</small>
              </div>
              <a
                className="contact-action"
                href={getPhoneHref(contact.hotline)}
                aria-label="Gọi hotline"
              >
                →
              </a>
            </article>
            <article className="contact-method">
              <div className="contact-icon">
                <img src={`${A}64850.png`} alt="" />
              </div>
              <div>
                <span>Email</span>
                <a href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
                <small>Phản hồi trong vòng 24 giờ</small>
              </div>
              <a
                className="contact-action"
                href={`mailto:${contact.email}`}
                aria-label="Gửi email"
              >
                →
              </a>
            </article>
            <article className="contact-method">
              <div className="contact-icon">
                <img src={`${A}9d481.svg`} alt="" />
              </div>
              <div>
                <span>Zalo</span>
                <a href={normalizeContactHref(contact.zalo, "zalo")} target="_blank" rel="noreferrer">Zalo Cây Phượng K18</a>
                <small>Nhắn tin trực tiếp qua Zalo</small>
              </div>
              <a
                className="contact-action"
                href={normalizeContactHref(contact.zalo, "zalo")}
                target="_blank"
                rel="noreferrer"
                aria-label="Liên hệ qua Zalo"
              >
                →
              </a>
            </article>
            <article className="contact-method">
              <div className="contact-icon">
                <img src={`${A}0a86e.svg`} alt="" />
              </div>
              <div>
                <span>Messenger</span>
                <a href={normalizeContactHref(contact.messenger, "messenger")} target="_blank" rel="noreferrer">Messenger Cây Phượng K18</a>
                <small>Nhắn tin trực tiếp qua Messenger</small>
              </div>
              <a
                className="contact-action"
                href={normalizeContactHref(contact.messenger, "messenger")}
                target="_blank"
                rel="noreferrer"
                aria-label="Liên hệ qua Messenger"
              >
                →
              </a>
            </article>
            <article className="contact-method">
              <div className="contact-icon">
                <img src={`${A}01681.png`} alt="" />
              </div>
              <div>
                <span>Địa chỉ</span>
                <strong>Quốc lộ 22, Ninh Sơn, Tây Ninh, Việt Nam</strong>
                <small>Không gian Homestay &amp; Nhà hàng</small>
              </div>
              <a
                className="contact-action"
                href="#ban-do"
                aria-label="Xem bản đồ"
              >
                →
              </a>
            </article>
          </div>
          <div className="contact-map-wrap" id="ban-do">
            <img
              className="contact-map"
              src={`${A}827c5.png`}
              alt="Bản đồ vị trí Cây Phượng K18"
            />
            <div className="map-card">
              <span>Vị trí của chúng tôi</span>
              <strong>Cây Phượng K18</strong>
              <a href="#ban-do">
                Xem chỉ đường <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="section sage contact-form-section">
        <div className="contact-form-layout">
          <div className="contact-form-intro">
            <p className="eyebrow">KẾT NỐI VỚI CHÚNG TÔI</p>
            <h2>
              Chúng tôi có thể
              <br />
              giúp gì cho bạn?
            </h2>
            <p>
              Chọn nhu cầu và để lại thông tin. Đội ngũ Cây Phượng K18 sẽ phản
              hồi trong thời gian sớm nhất.
            </p>
            <div className="response-note">
              <span>Thời gian phản hồi</span>
              <strong>Trong vòng 24 giờ</strong>
            </div>
          </div>
          <div className="contact-form-card">
            <fieldset className="request-options">
              <legend>Bạn muốn liên hệ về</legend>
              <div>
                {requestTypes.map((type, index) => (
                  <label
                    className={requestType === type ? "active" : ""}
                    key={type}
                  >
                    <input
                      type="radio"
                      name="request-type"
                      value={type}
                      checked={requestType === type}
                      onChange={() => {
                        setRequestType(type)
                        setSent(false)
                        setRating(0)
                      }}
                    />
                    <span className="radio-mark" />
                    <span className="request-option-copy">
                      <small>0{index + 1}</small>
                      <strong>{type}</strong>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="form-heading">
              <span className="form-heading-kicker">
                Yêu cầu trực tuyến · 0{requestTypes.indexOf(requestType) + 1}
              </span>
              <h3>{requestContent.title}</h3>
              <p>{requestContent.description}</p>
            </div>
            {sent ? (
              <div className="success">
                <strong>Cảm ơn bạn!</strong>
                <p>Yêu cầu “{requestType}” đã được gửi thành công.</p>
                <button onClick={() => setSent(false)}>Gửi yêu cầu khác</button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
              >
                <label className="form-field">
                  <span>Họ và tên</span>
                  <input
                    required
                    name="fullName"
                    autoComplete="name"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </label>
                <div className="form-row">
                  <label className="form-field">
                    <span>Số điện thoại</span>
                    <input
                      required
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Nhập số điện thoại"
                    />
                  </label>
                  <label className="form-field">
                    <span>Email</span>
                    <input
                      required
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Nhập địa chỉ email"
                    />
                  </label>
                </div>
                {requestType === "Feedback" && (
                  <fieldset className="rating-field">
                    <legend>Đánh giá của bạn</legend>
                    <div className="rating-options">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <label
                          className={star <= rating ? "selected" : ""}
                          key={star}
                        >
                          <input
                            required
                            type="radio"
                            name="rating"
                            value={star}
                            checked={rating === star}
                            onChange={() => setRating(star)}
                          />
                          <span aria-hidden="true">★</span>
                          <span className="sr-only">{star} sao</span>
                        </label>
                      ))}
                    </div>
                    <small>
                      {rating > 0
                        ? `Bạn đã chọn ${rating} sao`
                        : "Chọn từ 1 đến 5 sao"}
                    </small>
                  </fieldset>
                )}
                <label className="form-field">
                  <span>Nội dung</span>
                  <textarea
                    required
                    name="message"
                    placeholder={requestContent.placeholder}
                    rows={6}
                  />
                </label>
                <div className="form-submit">
                  <p>
                    Bằng việc gửi form, bạn đồng ý để chúng tôi liên hệ xác nhận
                    thông tin.
                  </p>
                  <button type="submit">
                    {requestContent.button} <span>→</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </Shell>
  )
}

