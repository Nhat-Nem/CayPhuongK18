import { useEffect, useState } from "react"
import Shell from "@/components/layout/Shell"
import { routes } from "@/config/routes"
import type { RecruitmentRecord } from "@/data/recruitmentPrototype"
import { getRecruitmentById } from "@/services/recruitmentApi"

export default function CareerDetailPage() {
  const id = new URLSearchParams(window.location.search).get("id") ?? ""
  const [item, setItem] = useState<RecruitmentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      setError("Thiếu mã vị trí tuyển dụng.")
      setLoading(false)
      return
    }

    getRecruitmentById(id)
      .then((result) => setItem(result.item))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Shell>
      <section className="career-detail-hero">
        <a href={routes.careers}>← Quay lại tuyển dụng</a>
        <p className="eyebrow">CƠ HỘI NGHỀ NGHIỆP</p>
        {loading ? (
          <h1>Đang tải thông tin tuyển dụng...</h1>
        ) : item ? (
          <>
            <h1>{item.title}</h1>
            <p className="career-detail-meta">
              {item.type} · {item.location}
            </p>
          </>
        ) : (
          <h1>Không tìm thấy vị trí tuyển dụng</h1>
        )}
      </section>

      <section className="career-detail-content">
        {error && <div className="career-data-notice error">{error}</div>}
        {item && (
          <>
            <div>
              <p className="eyebrow">THÔNG TIN VỊ TRÍ</p>
              <h2>Mô tả công việc</h2>
              <p>{item.description}</p>
            </div>
            <aside>
              <span>VỊ TRÍ</span>
              <strong>{item.title}</strong>
              <span>HÌNH THỨC</span>
              <strong>{item.type}</strong>
              <span>ĐỊA ĐIỂM</span>
              <strong>{item.location}</strong>
              <a
                href={`mailto:cayphuongk18@gmail.com?subject=Ứng tuyển ${encodeURIComponent(item.title)}`}
              >
                Gửi hồ sơ ứng tuyển <span>→</span>
              </a>
            </aside>
          </>
        )}
      </section>
    </Shell>
  )
}
