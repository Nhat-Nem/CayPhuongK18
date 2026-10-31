import { apiRequest } from "./api"

/** User fields returned by GET /api/v1/user in the current backend. */
export type StaffDirectoryUser = {
  id: string | number
  username?: string | null
  full_name?: string | null
  role?: "ADMIN" | "STAFF" | string
  is_activate?: boolean
}

/** Loads the existing user directory; no backend changes or new endpoints. */
export async function getStaffDirectory() {
  return apiRequest<StaffDirectoryUser[]>("/api/v1/user")
}
