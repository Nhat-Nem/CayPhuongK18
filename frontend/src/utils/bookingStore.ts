export interface BookingRequest {
  id: string
  fullName: string
  phone: string
  email: string
  checkIn: string
  checkOut: string
  guests: number
  roomId: string
  note: string
  createdAt: string
}

const BOOKING_STORAGE_KEY = "cay-phuong-booking-requests"

export function getBookingRequests(): BookingRequest[] {
  try {
    const saved = window.localStorage.getItem(BOOKING_STORAGE_KEY)
    return saved ? (JSON.parse(saved) as BookingRequest[]) : []
  } catch {
    return []
  }
}

export function addBookingRequest(request: BookingRequest) {
  window.localStorage.setItem(
    BOOKING_STORAGE_KEY,
    JSON.stringify([request, ...getBookingRequests()]),
  )
}
