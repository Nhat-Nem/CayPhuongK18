import { useEffect, useState, type FormEvent } from "react"
import { A } from "@/config/assets"
import Shell from "@/components/layout/Shell"
import Hero from "@/components/common/Hero"
import { createBookRequest } from "@/services/bookingApi"
import {
  CONTACT_UPDATED_EVENT,
  defaultContactSettings,
  getContactSettings,
  getPhoneHref,
  normalizeContactHref,
} from "@/services/contactApi"
import { getPublicRooms } from "@/services/roomApi"
import type { RoomPrototype } from "@/data/roomPrototype"

type RequestType = "Đặt bàn" | "Đặt phòng" | "Feedback"

const requestTypes: RequestType[] = ["Đặt bàn", "Đặt phòng", "Feedback"]

function getInitialRequestType(): RequestType {
  const type = new URLSearchParams(window.location.search).get("type")

  if (type === "room" || type === "booking" || type === "stay") {
    return "Đặt phòng"
  }

  if (type === "feedback") {
    return "Feedback"
  }

  return "Đặt bàn"
}

export default function ContactPage() {
  const [contact, setContact] = useState(defaultContactSettings)
  const [sent, setSent] = useState(false)
  const [rating, setRating] = useState(0)
  const [requestType, setRequestType] = useState<RequestType>(getInitialRequestType)

  const [rooms, setRooms] = useState<RoomPrototype[]>([])
  const [roomId, setRoomId] = useState<number | "">("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [submittedBookingCode, setSubmittedBookingCode] = useState("")

  useEffect(() => {
    const refresh = () => {
      void getContactSettings().then(setContact)
    }

    refresh()
    window.addEventListener(CONTACT_UPDATED_EVENT, refresh)

    return () => window.removeEventListener(CONTACT_UPDATED_EVENT, refresh)
  }, [])

  useEffect(() => {
    if (window.location.hash === "#yeu-cau-truc-tuyen") {
      window.setTimeout(() => {
        document
          .getElementById("yeu-cau-truc-tuyen")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 0)
    }
  }, [])

  useEffect(() => {
    const requestedRoom = Number(
      new URLSearchParams(window.location.search).get("room"),
    )

    getPublicRooms()
      .then((data) => {
        setRooms(data)

        if (data.some((room) => room.id === requestedRoom)) {
          setRoomId(requestedRoom)
        } else {
          setRoomId(data[0]?.id ?? "")
        }
      })
      .catch((error: Error) => setFormError(error.message))
      .finally(() => setLoadingRooms(false))
  }, [])

  const requestContent = {
    "Đặt bàn": {
      title: "Yêu cầu đặt bàn",
      description:
        "Chia sẻ thời gian, số lượng khách và mong muốn của bạn để chúng tôi chuẩn bị bàn chu đáo.",
      placeholder:
        "Ví dụ: Ngày giờ dùng bữa, số lượng khách, vị trí bàn hoặc món ăn quan tâm...",
      button: "Gửi yêu cầu đặt bàn",
    },
    "Đặt phòng": {
      title: "Yêu cầu đặt phòng",
      description:
        "Hãy để lại thông tin và nhu cầu lưu trú. Chúng tôi sẽ liên hệ xác nhận phòng phù hợp trong thời gian sớm nhất.",
      placeholder:
        "Ví dụ: Giường phụ, giờ nhận phòng dự kiến hoặc yêu cầu đặc biệt...",
      button: "Gửi yêu cầu đặt phòng",
    },
    Feedback: {
      title: "Gửi feedback",
      description:
        "Mọi góp ý của bạn đều giúp Cây Phượng K18 cải thiện trải nghiệm và phục vụ tốt hơn.",
      placeholder:
        "Chia sẻ cảm nhận, góp ý hoặc trải nghiệm của bạn tại Cây Phượng K18...",
      button: "Gửi feedback",
    },
  }[requestType]

  const changeRequestType = (type: RequestType) => {
    setRequestType(type)
    setSent(false)
    setRating(0)
    setFormError("")
    setSubmittedBookingCode("")
  }

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    if (requestType !== "Đặt phòng") {
      setSent(true)
      return
    }

    if (!roomId) {
      setFormError("Vui lòng chọn hạng phòng.")
      return
    }

    if (!checkIn || !checkOut) {
      setFormError("Vui lòng chọn ngày nhận phòng và ngày trả phòng.")
      return
    }

    if (checkOut <= checkIn) {
      setFormError("Ngày trả phòng phải sau ngày nhận phòng.")
      return
    }

    const form = new FormData(event.currentTarget)
    setSubmitting(true)

    try {
      const booking = await createBookRequest({
        fullName: String(form.get("fullName") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        roomId: Number(roomId),
        guests: Number(form.get("guests") ?? 1),
        checkIn,
        checkOut,
        note: String(form.get("message") ?? "").trim(),
      })

      setSubmittedBookingCode(booking.code)
      setSent(true)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Không thể gửi yêu cầu đặt phòng.",
      )
    } finally {
      setSubmitting(false)
    }
  }

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
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
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
                <a
                  href={normalizeContactHref(contact.zalo, "zalo")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Zalo Cây Phượng K18
                </a>
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
                <a
                  href={normalizeContactHref(contact.messenger, "messenger")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Messenger Cây Phượng K18
                </a>
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
              <a className="contact-action" href="#ban-do" aria-label="Xem bản đồ">
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

      <section
        className="section sage contact-form-section"
        id="yeu-cau-truc-tuyen"
      >
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
                      onChange={() => changeRequestType(type)}
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
                <p>
                  Yêu cầu “{requestType}” đã được gửi thành công.
                  {requestType === "Đặt phòng" && submittedBookingCode
                    ? ` Mã yêu cầu: ${submittedBookingCode}.`
                    : ""}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false)
                    setSubmittedBookingCode("")
                    setFormError("")
                  }}
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submitRequest}>
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
                      pattern="[0-9 +().-]{9,15}"
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

                {requestType === "Đặt phòng" && (
                  <>
                    <div className="form-row">
                      <label className="form-field">
                        <span>Hạng phòng</span>
                        <select
                          required
                          value={roomId}
                          onChange={(event) =>
                            setRoomId(
                              event.target.value
                                ? Number(event.target.value)
                                : "",
                            )
                          }
                          disabled={loadingRooms || rooms.length === 0}
                        >
                          <option value="">
                            {loadingRooms
                              ? "Đang tải hạng phòng..."
                              : "Chọn hạng phòng"}
                          </option>
                          {rooms.map((room) => (
                            <option value={room.id} key={room.id}>
                              {room.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="form-field">
                        <span>Số lượng khách</span>
                        <input
                          required
                          name="guests"
                          type="number"
                          min="1"
                          placeholder="Nhập số lượng khách"
                        />
                      </label>
                    </div>

                    <div className="form-row">
                      <label className="form-field">
                        <span>Ngày nhận phòng</span>
                        <input
                          required
                          name="checkIn"
                          type="date"
                          value={checkIn}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(event) => {
                            setCheckIn(event.target.value)
                            setFormError("")
                          }}
                        />
                      </label>

                      <label className="form-field">
                        <span>Ngày trả phòng</span>
                        <input
                          required
                          name="checkOut"
                          type="date"
                          value={checkOut}
                          min={checkIn || undefined}
                          onChange={(event) => {
                            setCheckOut(event.target.value)
                            setFormError("")
                          }}
                        />
                      </label>
                    </div>
                  </>
                )}

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
                    required={requestType !== "Đặt phòng"}
                    name="message"
                    placeholder={requestContent.placeholder}
                    rows={6}
                  />
                </label>

                {formError && (
                  <p className="contact-form-error" role="alert">
                    {formError}
                  </p>
                )}

                <div className="form-submit">
                  <p>
                    Bằng việc gửi form, bạn đồng ý để chúng tôi liên hệ xác nhận
                    thông tin.
                  </p>
                  <button type="submit" disabled={submitting}>
                    {submitting ? "Đang gửi..." : requestContent.button}{" "}
                    <span>→</span>
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
