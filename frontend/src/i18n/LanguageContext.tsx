import { createContext } from "react"

export type Language = "vi" | "en"

const LanguageContext = createContext<{
  language: Language
  toggleLanguage: () => void
}>({ language: "vi", toggleLanguage: () => undefined })

export default LanguageContext
