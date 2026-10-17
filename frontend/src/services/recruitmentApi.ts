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
  employmentType?: string | null
  location?: string | null
  requirements?: string | null
  benefits?: string | null
  deadline?: string | null
  status?: string | null
  createdAt?: string
  updatedAt?: string
}

function normalizeRecruitment(row: BackendRecruitment): RecruitmentRecord {
  return {
    id: String(row.id),
    title: String(row.title ?? "").trim(),
    type: String(row.employmentType ?? "").trim() || "Toàn thời gian",
    location: String(row.location ?? "").trim(),
    description: String(row.description ?? "").trim(),
  }
}

function toBackendPayload(payload: Omit<RecruitmentRecord, "id">) {
  return {
    title: payload.title.trim(),
    description: payload.description.trim() || undefined,
    employmentType: payload.type.trim() || undefined,
    location: payload.location.trim() || undefined,
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
