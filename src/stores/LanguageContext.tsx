import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { translations as defaultTranslations } from '@/lib/translations'
import {
  formatCurrency as utilsFormatCurrency,
  formatDate as utilsFormatDate,
} from '@/lib/utils'

export type Language = string

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (path: string, fallback?: string) => string
  formatCurrency: (
    amount: number | undefined | null,
    currency?: string,
  ) => string
  formatDate: (date: string | Date) => string
  formatTime: (date: string | Date) => string
  locale: string
  supportedLanguages: { code: string; name: string }[]
  addLanguage: (code: string, name: string) => void
  updateLanguage: (code: string, newName: string) => void
  deleteLanguage: (code: string) => void
  overrides: Record<string, Record<string, string>>
  updateTranslation: (lang: string, path: string, value: string) => void
  getAllKeys: () => string[]
  getDefaultTranslation: (lang: string, path: string) => string
}

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

const flattenObj = (obj: any, prefix = ''): Record<string, string> => {
  return Object.keys(obj).reduce((acc: any, k: string) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObj(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})
}

const flatDefaultTranslations = {
  pt: flattenObj(defaultTranslations.pt || {}),
  en: flattenObj(defaultTranslations.en || {}),
  es: flattenObj(defaultTranslations.es || {}),
}

const defaultSupported = [{ code: 'en', name: 'English' }]

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [supportedLanguages, setSupportedLanguages] = useState(defaultSupported)

  const [language, setLanguageState] = useState<Language>('en')

  const [overrides, setOverrides] = useState<
    Record<string, Record<string, string>>
  >(() => {
    const saved = localStorage.getItem('app_translation_overrides')
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem('app_language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem(
      'app_supported_langs',
      JSON.stringify(supportedLanguages),
    )
  }, [supportedLanguages])

  useEffect(() => {
    localStorage.setItem('app_translation_overrides', JSON.stringify(overrides))
  }, [overrides])

  const setLanguage = useCallback(
    (lang: string) => {
      if (supportedLanguages.find((l: any) => l.code === lang)) {
        setLanguageState(lang)
      } else {
        setLanguageState('en') // fallback
      }
    },
    [supportedLanguages],
  )

  const addLanguage = (code: string, name: string) => {
    if (!supportedLanguages.find((l: any) => l.code === code)) {
      setSupportedLanguages([...supportedLanguages, { code, name }])
    }
  }

  const updateLanguage = (code: string, newName: string) => {
    setSupportedLanguages((prev: any) =>
      prev.map((l: any) => (l.code === code ? { ...l, name: newName } : l)),
    )
  }

  const deleteLanguage = (code: string) => {
    setSupportedLanguages((prev: any) =>
      prev.filter((l: any) => l.code !== code),
    )
    setOverrides((prev) => {
      const newOverrides = { ...prev }
      delete newOverrides[code]
      return newOverrides
    })
    if (language === code) {
      const remaining = supportedLanguages.filter((l: any) => l.code !== code)
      if (remaining.length > 0) {
        setLanguageState(remaining[0].code)
      }
    }
  }

  const updateTranslation = (lang: string, path: string, value: string) => {
    setOverrides((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [path]: value,
      },
    }))
  }

  const getAllKeys = () =>
    Object.keys((flatDefaultTranslations as any).en || {})

  const getDefaultTranslation = (lang: string, path: string) => {
    const flat = (flatDefaultTranslations as any)[lang]
    if (flat && flat[path] !== undefined) return flat[path]
    return (flatDefaultTranslations as any)['en']?.[path] || path
  }

  const t = (path: string, fallback?: string): string => {
    if (overrides[language] && overrides[language][path] !== undefined) {
      return overrides[language][path]
    }
    const flat = (flatDefaultTranslations as any)[language]
    if (flat && flat[path] !== undefined) return flat[path]

    // Fallback to english if available
    const flatEn = (flatDefaultTranslations as any)['en']
    if (flatEn && flatEn[path] !== undefined) return flatEn[path]

    return fallback || path
  }

  const locale =
    language === 'en'
      ? 'en-US'
      : language === 'es'
        ? 'es-ES'
        : language === 'pt'
          ? 'pt-BR'
          : `${language}-${language.toUpperCase()}`

  const formatCurrency = (
    amount: number | undefined | null,
    currency?: string,
  ) => {
    return utilsFormatCurrency(amount, currency, locale)
  }

  const formatDate = (date: string | Date) => {
    return utilsFormatDate(date, locale)
  }

  const formatTime = (date: string | Date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: locale === 'en-US',
    }).format(new Date(date))
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatDate,
        formatTime,
        locale,
        supportedLanguages,
        addLanguage,
        updateLanguage,
        deleteLanguage,
        overrides,
        updateTranslation,
        getAllKeys,
        getDefaultTranslation,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
