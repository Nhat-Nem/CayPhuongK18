import {
  recruitmentPrototype,
  type RecruitmentRecord,
} from "@/data/recruitmentPrototype"

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")
const API_PATH =
  (import.meta.env.VITE_RECRUITMENT_API_PATH ?? "/api/v1/recruitments").replace(
    /\/$/,
    "",
  )
const ADMIN_TOKEN_KEY = "cay-phuong-admin-token"
const FALLBACK_STORAGE_KEY = "cay-phuong-recruitment-prototype-v1"

export type RecruitmentDataSource = "api" | "prototype"

export interface RecruitmentListResult {
  items: RecruitmentRecord[]
  source: RecruitmentDataSource
}

export interface RecruitmentItemResult {
  item: RecruitmentRecord
  source: RecruitmentDataSource
}

type BackendRecruitment = {
  id?: string | number
  title?: string
  jobTitle?: string
  name?: string
  type?: string
  employmentType?: string
  location?: string
  description?: string
  content?: string
}

class RecruitmentApiUnavailableError extends Error {}

function clonePrototype() {
  return recruitmentPrototype.map((item) => ({ ...item }))
}

function readFallback(): RecruitmentRecord[] {
  try {
    const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY)
    if (!raw) return clonePrototype()

    const parsed = JSON.parse(raw) as RecruitmentRecord[]
    if (!Array.isArray(parsed)) return clonePrototype()

    return parsed.map((item) => ({
      id: String(item.id),
      title: String(item.title ?? ""),
      type: String(item.type ?? ""),
      location: String(item.location ?? ""),
      description: String(item.description ?? ""),
    }))
  } catch {
    return clonePrototype()
  }
}

function writeFallback(items: RecruitmentRecord[]) {
  window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(items))
}

function normalizeRecruitment(
  row: BackendRecruitment,
  index = 0,
): RecruitmentRecord {
  return {
    id: String(row.id ?? `api-${index + 1}`),
    title: String(row.title ?? row.jobTitle ?? row.name ?? "").trim(),
    type: String(row.type ?? row.employmentType ?? "").trim(),
    location: String(row.location ?? "").trim(),
    description: String(row.description ?? row.content ?? "").trim(),
  }
}

async function parseError(response: Response) {
  let message = `API error ${response.status}`
  try {
    const data = (await response.json()) as {
      message?: string | string[]
      error?: string
    }
    if (Array.isArray(data.message)) message = data.message.join(", ")
    else if (data.message) message = data.message
    else if (data.error) message = data.error
  } catch {
    // Giữ thông báo mặc định.
  }
  return message
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = window.localStorage.getItem(ADMIN_TOKEN_KEY)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {}),
      },
    })
  } catch {
    throw new RecruitmentApiUnavailableError(
      "Backend tuyển dụng chưa khả dụng.",
    )
  }

  if (response.status === 404 || response.status === 405) {
    throw new RecruitmentApiUnavailableError(
      "Backend hiện chưa có API tuyển dụng.",
    )
  }

  if (!response.ok) throw new Error(await parseError(response))
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getRecruitmentApiPath() {
  return API_PATH
}

export async function getRecruitments(): Promise<RecruitmentListResult> {
  try {
    const response = await request<
      BackendRecruitment[] | { data?: BackendRecruitment[] }
    >(API_PATH)
    const rows = Array.isArray(response) ? response : response.data ?? []
    return {
      items: rows.map(normalizeRecruitment),
      source: "api",
    }
  } catch (error) {
    if (!(error instanceof RecruitmentApiUnavailableError)) throw error
    return { items: readFallback(), source: "prototype" }
  }
}

export async function getRecruitmentById(
  id: string,
): Promise<RecruitmentItemResult> {
  try {
    const response = await request<BackendRecruitment>(
      `${API_PATH}/${encodeURIComponent(id)}`,
    )
    return { item: normalizeRecruitment(response), source: "api" }
  } catch (error) {
    if (!(error instanceof RecruitmentApiUnavailableError)) throw error

    // Nếu backend chỉ có API danh sách nhưng chưa có API chi tiết,
    // vẫn tận dụng danh sách trước khi rơi về prototype local.
    try {
      const listResponse = await request<
        BackendRecruitment[] | { data?: BackendRecruitment[] }
      >(API_PATH)
      const rows = Array.isArray(listResponse)
        ? listResponse
        : listResponse.data ?? []
      const apiItem = rows
        .map(normalizeRecruitment)
        .find((record) => record.id === id)
      if (apiItem) return { item: apiItem, source: "api" }
    } catch (listError) {
      if (!(listError instanceof RecruitmentApiUnavailableError)) throw listError
    }

    const item = readFallback().find((record) => record.id === id)
    if (!item) throw new Error("Không tìm thấy thông tin tuyển dụng.")
    return { item, source: "prototype" }
  }
}

export async function updateRecruitment(
  id: string,
  payload: Omit<RecruitmentRecord, "id">,
): Promise<RecruitmentItemResult> {
  try {
    const response = await request<BackendRecruitment>(
      `${API_PATH}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    )
    return { item: normalizeRecruitment(response), source: "api" }
  } catch (error) {
    if (!(error instanceof RecruitmentApiUnavailableError)) throw error

    const items = readFallback()
    const index = items.findIndex((record) => record.id === id)
    if (index < 0) throw new Error("Không tìm thấy thông tin tuyển dụng.")

    const item: RecruitmentRecord = { id, ...payload }
    items[index] = item
    writeFallback(items)
    return { item, source: "prototype" }
  }
}

export async function deleteRecruitment(
  id: string,
): Promise<RecruitmentDataSource> {
  try {
    await request(`${API_PATH}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    return "api"
  } catch (error) {
    if (!(error instanceof RecruitmentApiUnavailableError)) throw error

    const items = readFallback()
    const nextItems = items.filter((record) => record.id !== id)
    if (nextItems.length === items.length) {
      throw new Error("Không tìm thấy thông tin tuyển dụng.")
    }
    writeFallback(nextItems)
    return "prototype"
  }
}
