import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import AuthBrandPanel from '../components/AuthBrandPanel'

// Returns a 0–5 strength score; the human-readable label is resolved via i18n.
function passwordScore(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password.length < 8) {
      setError(t('auth.register.pwTooShort'))
      setLoading(false)
      return
    }

    try {
      await register(formData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.register.failed'))
    } finally {
      setLoading(false)
    }
  }

  const score = passwordScore(formData.password)
  const strengthLabel = t('auth.register.strength')[score] || ''
  const strengthColors = [
    'bg-ink-200 dark:bg-ink-700',
    'bg-rose-400',
    'bg-amber-400',
    'bg-yellow-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-ink-950">
      <AuthBrandPanel
        title={t('auth.register.brandTitle')}
        subtitle={t('auth.register.brandSubtitle')}
        highlights={t('auth.register.brandHighlights')}
      />

      <div className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('auth.backToHome')}
          </Link>

          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">{t('auth.register.title')}</h1>
          <p className="mt-2 text-ink-600 dark:text-ink-300">{t('auth.register.subtitle')}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                {t('auth.register.email')} <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                  {t('auth.register.username')} <span className="text-rose-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength="3"
                  autoComplete="username"
                  className="input"
                  placeholder="mindspark"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                  {t('auth.register.fullName')}
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  className="input"
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-ink-800 dark:text-ink-200">
                  {t('auth.register.password')} <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {showPassword ? t('auth.register.hide') : t('auth.register.show')}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength="8"
                autoComplete="new-password"
                className="input"
                placeholder={t('auth.register.passwordPlaceholder')}
                value={formData.password}
                onChange={handleChange}
              />

              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i <= score ? strengthColors[score] : 'bg-ink-200 dark:bg-ink-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                    {t('auth.register.strengthPrefix')} <span className="font-medium text-ink-700 dark:text-ink-200">{strengthLabel}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3.5 text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('auth.register.submitting')}
                </>
              ) : (
                <>
                  {t('auth.register.submit')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            <p className="text-xs text-ink-500 dark:text-ink-400 text-center">
              {t('auth.register.terms')}
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-ink-600 dark:text-ink-300">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200">
              {t('auth.register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
