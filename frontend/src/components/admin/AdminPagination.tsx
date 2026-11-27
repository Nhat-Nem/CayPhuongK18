import { useState } from "react"

const PAGE_SIZE = 10

/** Client-side paging for admin tables: returns the rows of the current page. */
export function usePagination<T>(rows: T[]) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  // Clamp so a filter that shrinks the list never leaves an empty page.
  const current = Math.min(page, totalPages)

  return {
    page: current,
    totalPages,
    total: rows.length,
    setPage,
    pageRows: rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
  }
}

type AdminPaginationProps = {
  page: number
  totalPages: number
  total: number
  setPage: (page: number) => void
}

export default function AdminPagination({ page, totalPages, total, setPage }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="admin-pagination" aria-label="Phân trang">
      <button type="button" className="admin-secondary-button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
        ‹ Trước
      </button>
      <span>
        Trang {page}/{totalPages} · {total} mục
      </span>
      <button type="button" className="admin-secondary-button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
        Sau ›
      </button>
    </nav>
  )
}
