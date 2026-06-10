import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  translate,
  translatePlural,
} from '../i18n/translations'

const I18nContext = createContext()

export const LANG_STORAGE_KEY = 'language'

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

const SUPPORTED = LANGUAGES.map((l) => l.code)

function getInitialLang() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  const stored = localStorage.getItem(LANG_STORAGE_KEY)
  if (SUPPORTED.includes(stored)) return stored
  const browser = (navigator.language || '').slice(0, 2).toLowerCase()
  return SUPPORTED.includes(browser) ? browser : DEFAULT_LANGUAGE
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next) => {
    if (SUPPORTED.includes(next)) setLangState(next)
  }, [])

  // t() resolves strings/arrays/objects; tc() handles pluralized counts.
  const t = useCallback((path, vars) => translate(lang, path, vars), [lang])
  const tc = useCallback(
    (path, count, vars) => translatePlural(lang, path, count, vars),
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, tc, languages: LANGUAGES }),
    [lang, setLang, t, tc],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
