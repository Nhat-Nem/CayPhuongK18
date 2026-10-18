export interface RecruitmentRecord {
  id: string
  title: string
  type: string
  location: string
  description: string
  salary: string
}

export const recruitmentPrototype: RecruitmentRecord[] = [
  {
    id: "td-001",
    title: "Nhân viên phục vụ nhà hàng",
    type: "fulltime",
    location: "Tây Ninh",
    description:
      "Đón tiếp và phục vụ khách hàng chu đáo, phối hợp cùng đội ngũ để mang đến trải nghiệm ẩm thực ấm áp.",
    salary: "8000000",
  },
  {
    id: "td-002",
    title: "Nhân viên buồng phòng",
    type: "fulltime",
    location: "Tây Ninh",
    description:
      "Chăm sóc không gian phòng nghỉ sạch sẽ, chỉn chu và hỗ trợ khách trong suốt thời gian lưu trú.",
    salary: "7500000",
  },
  {
    id: "td-003",
    title: "Phụ bếp",
    type: "part-time",
    location: "Tây Ninh",
    description:
      "Chuẩn bị nguyên liệu tươi mới, hỗ trợ bếp chính và giữ gìn tiêu chuẩn vệ sinh trong khu vực bếp.",
    salary: "5000000",
  },
]
