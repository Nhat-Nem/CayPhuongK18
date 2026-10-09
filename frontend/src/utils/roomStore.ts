// Legacy compatibility layer.
// Room data now comes from NestJS/MySQL through services/roomApi.ts.
export {
  createRoom,
  deleteRoom,
  getPublicRooms,
  getRoomById,
  getRooms,
  updateRoom,
} from "@/services/roomApi"
