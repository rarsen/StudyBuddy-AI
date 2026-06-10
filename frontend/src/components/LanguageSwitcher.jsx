import { useI18n } from '../context/I18nContext'

// Compact segmented control for the two supported languages (EN / УК).
function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, languages, t } = useI18n()

  return (
    <div
      role="group"
      aria-label={t('prefs.selectLanguage')}
      className={`inline-flex items-center rounded-lg border border-ink-200 dark:border-ink-700 p-0.5 ${className}`}
    >
      {languages.map((l) => {
        const active = lang === l.code
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={active}
            title={l.label}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              active
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-ink-500 hover:text-primary-700 dark:text-ink-400 dark:hover:text-primary-300'
            }`}
          >
            {l.short}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSwitcher
