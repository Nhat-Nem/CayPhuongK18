export type RoomStatus = "Đang hoạt động" | "Tạm ngưng"

export type RoomPrototype = {
  id: number
  code: string
  name: string
  type: string
  price: number
  status: RoomStatus
  capacity: number
  bed: string
  view: string
  description: string
  images: [string, string]
}

// Sprint 1 prototype data for US.01–US.05.
// This is intentionally local/mock data. API integration belongs to the backend tasks.
export const roomPrototypeData: RoomPrototype[] = [
  {
    id: 1,
    code: "P001",
    name: "Phòng Deluxe Hướng Bể Bơi",
    type: "Deluxe",
    price: 850000,
    status: "Đang hoạt động",
    capacity: 2,
    bed: "King-size",
    view: "Hướng bể bơi",
    description:
      "Không gian gỗ ấm cúng, tiện nghi đầy đủ cùng tầm nhìn thoáng đãng, phù hợp cho cặp đôi hoặc khách đi nghỉ dưỡng ngắn ngày.",
    images: ["8bb71.png", "a0b15.png"],
  },
  {
    id: 2,
    code: "P002",
    name: "Phòng Glamping Deluxe",
    type: "Glamping",
    price: 950000,
    status: "Đang hoạt động",
    capacity: 2,
    bed: "Queen-size",
    view: "Hướng đồng lúa",
    description:
      "Không gian glamping gần gũi thiên nhiên, riêng tư và thoáng mát, thích hợp cho khách muốn trải nghiệm phong cách nghỉ dưỡng mới lạ.",
    images: ["305a2.png", "58627.png"],
  },
  {
    id: 3,
    code: "P003",
    name: "Phòng Deluxe Hướng Núi",
    type: "Deluxe",
    price: 900000,
    status: "Đang hoạt động",
    capacity: 2,
    bed: "King-size",
    view: "Hướng núi",
    description:
      "Phòng nghỉ yên tĩnh với nội thất gỗ và tầm nhìn hướng núi, phù hợp cho khách muốn thư giãn trong không gian riêng tư.",
    images: ["0639c.png", "ff945.png"],
  },
]

export const formatRoomPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price)
