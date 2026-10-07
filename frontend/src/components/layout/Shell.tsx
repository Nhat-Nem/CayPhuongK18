import type { ReactNode } from "react"
import Header from "@/components/layout/Header"
import SocialRail from "@/components/layout/SocialRail"
import QuickPhone from "@/components/layout/QuickPhone"
import Footer from "@/components/layout/Footer"

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <SocialRail />
      <QuickPhone />
      <main>{children}</main>
      <Footer />
    </>
  )
}

