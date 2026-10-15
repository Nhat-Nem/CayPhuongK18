export interface RecruitmentRecord {
  id: string
  title: string
  type: string
  location: string
  description: string
}

export const recruitmentPrototype: RecruitmentRecord[] = [
  {
    id: "td-001",
    title: "Nhân viên phục vụ nhà hàng",
    type: "Toàn thời gian",
    location: "Tây Ninh",
    description:
      "Đón tiếp và phục vụ khách hàng chu đáo, phối hợp cùng đội ngũ để mang đến trải nghiệm ẩm thực ấm áp.",
  },
  {
    id: "td-002",
    title: "Nhân viên buồng phòng",
    type: "Toàn thời gian",
    location: "Tây Ninh",
    description:
      "Chăm sóc không gian phòng nghỉ sạch sẽ, chỉn chu và hỗ trợ khách trong suốt thời gian lưu trú.",
  },
  {
    id: "td-003",
    title: "Phụ bếp",
    type: "Toàn thời gian",
    location: "Tây Ninh",
    description:
      "Chuẩn bị nguyên liệu tươi mới, hỗ trợ bếp chính và giữ gìn tiêu chuẩn vệ sinh trong khu vực bếp.",
  },
]
