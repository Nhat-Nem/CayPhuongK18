import type { ReactNode } from "react"

export default function ButtonLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a className="button-link" href={href}>
      {children}
    </a>
  )
}

