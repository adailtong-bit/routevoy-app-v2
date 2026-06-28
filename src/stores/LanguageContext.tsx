import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (
    key: string,
    defaultValue?: string,
    params?: Record<string, string>,
  ) => string
  formatCurrency: (value: number) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to English as per requirement
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language') as Language
      if (saved && ['en', 'pt', 'es'].includes(saved)) return saved
    } catch {
      /* intentionally ignored */
    }
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (
    key: string,
    defaultValue?: string,
    params?: Record<string, string>,
  ): string => {
    const keys = key.split('.')
    let current: any = translations[language]

    for (const k of keys) {
      if (current[k] === undefined) {
        let fallback: any = translations['en']
        for (const fk of keys) {
          if (fallback[fk] === undefined) return defaultValue || key
          fallback = fallback[fk]
        }
        current = fallback
        break
      }
      current = current[k]
    }

    let result = typeof current === 'string' ? current : defaultValue || key
    if (params) {
      Object.entries(params).forEach(([pk, pv]) => {
        result = result.replace(new RegExp(`{{${pk}}}`, 'g'), pv)
      })
    }
    return result
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(
      language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US',
      {
        style: 'currency',
        currency: language === 'pt' ? 'BRL' : language === 'es' ? 'EUR' : 'USD',
      },
    ).format(value)
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, formatCurrency }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context)
    throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
