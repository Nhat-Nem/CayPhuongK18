import { useEffect } from "react"
import type { Language } from "@/i18n/LanguageContext"
import { translations } from "@/i18n/translations"

const originalText = new WeakMap<Node, string>()
const originalPlaceholders = new WeakMap<HTMLElement, string>()

export default function usePageTranslation(language: Language) {
  useEffect(() => {
    document.documentElement.lang = language

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
        if (node.parentElement?.closest(".language, .mobile-language")) {
          return
        }
        const current = node.nodeValue
        let original = originalText.get(node)
        if (!original) {
          original = current
          originalText.set(node, original)
        } else if (
          current !== original &&
          current.trim() !== translations[original.trim()]
        ) {
          original = current
          originalText.set(node, original)
        }
        const translated = translations[original.trim()]
        const nextValue =
          language === "en" && translated
            ? original.replace(original.trim(), translated)
            : original
        if (current !== nextValue) {
          node.nodeValue = nextValue
        }
        return
      }
      if (!(node instanceof HTMLElement)) return
      if (node.matches(".language, .mobile-language")) return
      if (
        node instanceof HTMLInputElement ||
        node instanceof HTMLTextAreaElement
      ) {
        let original = originalPlaceholders.get(node)
        if (!original) {
          original = node.placeholder
          originalPlaceholders.set(node, original)
        } else if (
          node.placeholder !== original &&
          node.placeholder !== translations[original]
        ) {
          original = node.placeholder
          originalPlaceholders.set(node, original)
        }
        const nextPlaceholder =
          language === "en" ? translations[original] || original : original
        if (node.placeholder !== nextPlaceholder) {
          node.placeholder = nextPlaceholder
        }
      }
      node.childNodes.forEach(translateNode)
    }

    translateNode(document.body)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "characterData" ||
          mutation.type === "attributes"
        ) {
          translateNode(mutation.target)
        }
        mutation.addedNodes.forEach(translateNode)
      })
    })
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["placeholder"],
      characterData: true,
      childList: true,
      subtree: true,
    })
    return () => observer.disconnect()
  }, [language])
}

