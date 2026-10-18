import type { RecruitmentRecord } from "@/data/recruitmentPrototype"
import { apiRequest } from "./api"

const API_PATH = "/api/v1/recruitments"

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
  id: string | number
  title: string
  description?: string | null
  position?: string | null
  quantity?: number | null
  salary?: string | null

  // Hỗ trợ cả response cũ lẫn response snake_case mới.
  employmentType?: string | null
  employment_type?: string | null

  location?: string | null
  requirements?: string | null
  benefits?: string | null
  deadline?: string | null
  status?: string | null
  createdAt?: string
  updatedAt?: string
}

export function normalizeEmploymentType(value?: string | null) {
  const normalized = String(value ?? "").trim().toLocaleLowerCase("vi")

  if (
    normalized === "fulltime" ||
    normalized === "full-time" ||
    normalized === "toàn thời gian" ||
    normalized === "toan thoi gian"
  ) {
    return "fulltime"
  }

  if (
    normalized === "part-time" ||
    normalized === "parttime" ||
    normalized === "bán thời gian" ||
    normalized === "ban thoi gian"
  ) {
    return "part-time"
  }

  return normalized || "fulltime"
}

export function employmentTypeLabel(value?: string | null) {
  const normalized = normalizeEmploymentType(value)

  if (normalized === "part-time") return "Bán thời gian"
  if (normalized === "fulltime") return "Toàn thời gian"

  return String(value ?? "").trim() || "Toàn thời gian"
}

export function formatRecruitmentSalary(value?: string | null) {
  const raw = String(value ?? "").trim()
  if (!raw) return "Thỏa thuận"

  const digits = raw.replace(/[^0-9]/g, "")
  if (!digits) return raw

  const numeric = Number(digits)
  if (!Number.isFinite(numeric) || numeric <= 0) return raw

  return `${new Intl.NumberFormat("vi-VN").format(numeric)} VNĐ/tháng`
}

function normalizeRecruitment(row: BackendRecruitment): RecruitmentRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? "").trim(),
    type: normalizeEmploymentType(row.employment_type ?? row.employmentType),
    location: String(row.location ?? "").trim(),
    description: String(row.description ?? "").trim(),
    salary: String(row.salary ?? "").trim(),
  }
}

function toBackendPayload(payload: Omit<RecruitmentRecord, "id">) {
  return {
    title: payload.title.trim(),
    description: payload.description.trim() || undefined,

    // Theo request mới: snake_case + giá trị kỹ thuật fulltime / part-time.
    employment_type: normalizeEmploymentType(payload.type),

    location: payload.location.trim() || undefined,
    salary: payload.salary.trim() || undefined,
  }
}

export function getRecruitmentApiPath() {
  return API_PATH
}

export async function getRecruitments(): Promise<RecruitmentListResult> {
  const rows = await apiRequest<BackendRecruitment[]>(API_PATH)

  return {
    items: rows.map(normalizeRecruitment),
    source: "api",
  }
}

export async function getRecruitmentById(
  id: string,
): Promise<RecruitmentItemResult> {
  const row = await apiRequest<BackendRecruitment>(
    `${API_PATH}/${encodeURIComponent(id)}`,
  )

  return {
    item: normalizeRecruitment(row),
    source: "api",
  }
}

export async function createRecruitment(
  payload: Omit<RecruitmentRecord, "id">,
): Promise<RecruitmentItemResult> {
  const row = await apiRequest<BackendRecruitment>(API_PATH, {
    method: "POST",
    body: JSON.stringify(toBackendPayload(payload)),
  })

  return {
    item: normalizeRecruitment(row),
    source: "api",
  }
}

export async function updateRecruitment(
  id: string,
  payload: Omit<RecruitmentRecord, "id">,
): Promise<RecruitmentItemResult> {
  const row = await apiRequest<BackendRecruitment>(
    `${API_PATH}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(toBackendPayload(payload)),
    },
  )

  return {
    item: normalizeRecruitment(row),
    source: "api",
  }
}

export async function deleteRecruitment(
  id: string,
): Promise<RecruitmentDataSource> {
  await apiRequest<{ message?: string }>(
    `${API_PATH}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )

  return "api"
}
