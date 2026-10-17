import { useEffect, type ReactNode } from "react"

type AdminFormModalProps = {
  open: boolean
  eyebrow?: string
  title: string
  children: ReactNode
  onClose: () => void
  size?: "medium" | "wide"
}

export default function AdminFormModal({
  open,
  eyebrow,
  title,
  children,
  onClose,
  size = "medium",
}: AdminFormModalProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="admin-room-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={`admin-room-modal admin-form-modal admin-form-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-form-modal-heading">
          <div>
            {eyebrow && <p className="admin-room-eyebrow">{eyebrow}</p>}
            <h2>{title}</h2>
          </div>

          <button
            className="admin-form-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            title="Đóng"
          >
            ×
          </button>
        </div>

        {children}
      </section>
    </div>
  )
}
