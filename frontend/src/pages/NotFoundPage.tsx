import ButtonLink from "@/components/common/ButtonLink"
import Shell from "@/components/layout/Shell"

const commonCauses = [
  {
    title: "Địa chỉ chưa chính xác",
    description: "Có thể đường dẫn bị nhập sai hoặc thiếu một phần.",
  },
  {
    title: "Trang đã được chuyển",
    description: "Nội dung có thể đã đổi sang địa chỉ mới.",
  },
  {
    title: "Liên kết đã cũ",
    description: "Trang có thể đã bị gỡ hoặc không còn được sử dụng.",
  },
]

export default function NotFoundPage() {
  return (
    <Shell>
      <section className="not-found-page" aria-labelledby="not-found-title">
        <div className="not-found-content">
          <p className="not-found-eyebrow">CÂY PHƯỢNG K18 · 404</p>
          <p className="not-found-code" aria-hidden="true">404</p>
          <h1 id="not-found-title">Rất tiếc, không tìm thấy trang</h1>
          <p className="not-found-intro">
            Địa chỉ này hiện không mở được. Bạn có thể quay về trang chủ hoặc
            chọn một trong những mục bên dưới để tiếp tục khám phá.
          </p>

          <ul className="not-found-causes">
            {commonCauses.map((cause) => (
              <li key={cause.title}>
                <strong>{cause.title}</strong>
                <span>{cause.description}</span>
              </li>
            ))}
          </ul>

          <nav className="not-found-actions" aria-label="Điều hướng từ trang lỗi">
            <ButtonLink href="/">Về trang chủ</ButtonLink>
            <a className="not-found-secondary" href="/lien-he">
              Liên hệ với chúng tôi
            </a>
          </nav>
        </div>
      </section>
    </Shell>
  )
}
