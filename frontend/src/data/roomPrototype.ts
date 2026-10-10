export type RoomStatus = "AVAILABLE" | "UNAVAILABLE"

export const ROOM_STATUS_LABEL: Record<RoomStatus, string> = {
  AVAILABLE: "Đang hoạt động",
  UNAVAILABLE: "Tạm ngưng",
}

export function getRoomStatusLabel(status: RoomStatus) {
  return ROOM_STATUS_LABEL[status]
}

export type RoomPrototype = {
  id: number
  code: string
  name: string
  type: string
  price: number
  status: RoomStatus
  capacity: number
  description: string
  images: [string, string]
}

export const roomPrototypeData: RoomPrototype[] = [
  {
    id: 1,
    code: "P001",
    name: "Phòng Deluxe Hướng Bể Bơi",
    type: "Deluxe",
    price: 850000,
    status: "AVAILABLE",
    capacity: 2,
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
    status: "AVAILABLE",
    capacity: 2,
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
    status: "AVAILABLE",
    capacity: 2,
    description:
      "Phòng nghỉ yên tĩnh với nội thất gỗ và không gian riêng tư, phù hợp cho khách muốn thư giãn.",
    images: ["0639c.png", "ff945.png"],
  },
]

export const formatRoomPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price)
