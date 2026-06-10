import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import { userService } from '../services/user'
import Layout from '../components/Layout'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

function ThemeSegment() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const options = [
    {
      value: 'light',
      label: t('prefs.light'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: t('prefs.dark'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      ),
    },
  ]
  return (
    <div className="inline-flex items-center rounded-xl border border-ink-200 dark:border-ink-700 p-0.5">
      {options.map((opt) => {
        const active = theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-ink-500 hover:text-primary-700 dark:text-ink-400 dark:hover:text-primary-300'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Profile() {
  const { user, updateUser } = useAuth()
  const { t, lang } = useI18n()
  const dateLocale = lang === 'uk' ? uk : undefined
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    full_name: user?.full_name || '',
    password: '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const updateData = {}
    if (formData.email !== user.email) updateData.email = formData.email
    if (formData.username !== user.username) updateData.username = formData.username
    if (formData.full_name !== user.full_name) updateData.full_name = formData.full_name
    if (formData.password) {
      if (formData.password.length < 8) {
        setError(t('profile.pwShort'))
        setLoading(false)
        return
      }
      updateData.password = formData.password
    }

    if (Object.keys(updateData).length === 0) {
      setError(t('profile.noChanges'))
      setLoading(false)
      return
    }

    try {
      const updatedUser = await userService.updateProfile(updateData)
      updateUser(updatedUser)
      setSuccess(t('profile.success'))
      setEditing(false)
      setFormData({ ...formData, password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || t('profile.updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      username: user?.username || '',
      full_name: user?.full_name || '',
      password: '',
    })
    setEditing(false)
    setError('')
    setSuccess('')
  }

  const initials = (user?.full_name || user?.username || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white p-8 shadow-glow-lg">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-blob" />

          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center text-2xl font-display font-extrabold">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-3xl font-extrabold">
                {user?.full_name || user?.username}
              </h1>
              <p className="text-white/85">@{user?.username}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="chip bg-white/15 border border-white/25 text-white text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full ${user?.is_active ? 'bg-emerald-300' : 'bg-rose-300'}`} />
                  {user?.is_active ? t('profile.active') : t('profile.inactive')}
                </span>
                {user?.role && (
                  <span className="chip bg-white/15 border border-white/25 text-white text-xs capitalize">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-4 py-3 text-sm animate-fade-in">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 px-4 py-3 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Preferences */}
        <div className="mt-8 card">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">{t('prefs.title')}</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">{t('prefs.subtitle')}</p>

          <div className="mt-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-medium text-ink-900 dark:text-ink-100">{t('prefs.theme')}</div>
                <div className="text-sm text-ink-500 dark:text-ink-400">{t('prefs.themeHint')}</div>
              </div>
              <ThemeSegment />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-5 border-t border-ink-100 dark:border-ink-800">
              <div>
                <div className="font-medium text-ink-900 dark:text-ink-100">{t('prefs.language')}</div>
                <div className="text-sm text-ink-500 dark:text-ink-400">{t('prefs.languageHint')}</div>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="mt-6 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">{t('profile.accountInfo')}</h2>
              <p className="text-sm text-ink-500 dark:text-ink-400">{t('profile.accountInfoSub')}</p>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn btn-secondary text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('profile.editProfile')}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">{t('profile.email')}</label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                ) : (
                  <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-800/40 px-4 py-3 text-ink-900 dark:text-ink-100">
                    {user?.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">{t('profile.username')}</label>
                {editing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input"
                    required
                    minLength="3"
                  />
                ) : (
                  <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-800/40 px-4 py-3 text-ink-900 dark:text-ink-100">
                    {user?.username}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">{t('profile.fullName')}</label>
              {editing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                />
              ) : (
                <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-800/40 px-4 py-3 text-ink-900 dark:text-ink-100">
                  {user?.full_name || <span className="text-ink-400 dark:text-ink-500">{t('profile.notProvided')}</span>}
                </div>
              )}
            </div>

            {editing && (
              <div>
                <label className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5">{t('profile.newPassword')}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder={t('profile.pwPlaceholder')}
                  minLength="8"
                />
                <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                  {t('profile.pwHint')}
                </p>
              </div>
            )}

            {editing && (
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? t('common.saving') : t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account details */}
        <div className="mt-6 card">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100 mb-4">{t('profile.accountDetails')}</h2>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <dt className="text-ink-500 dark:text-ink-400">{t('profile.status')}</dt>
              <dd className={`font-semibold ${user?.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {user?.is_active ? t('profile.active') : t('profile.inactive')}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <dt className="text-ink-500 dark:text-ink-400">{t('profile.role')}</dt>
              <dd className="font-semibold text-ink-900 dark:text-ink-100 capitalize">{user?.role}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
              <dt className="text-ink-500 dark:text-ink-400">{t('profile.memberSince')}</dt>
              <dd className="font-semibold text-ink-900 dark:text-ink-100">
                {user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy', { locale: dateLocale }) : t('profile.na')}
              </dd>
            </div>
            {user?.last_login && (
              <div className="flex justify-between py-2 border-b border-ink-100 dark:border-ink-800">
                <dt className="text-ink-500 dark:text-ink-400">{t('profile.lastLogin')}</dt>
                <dd className="font-semibold text-ink-900 dark:text-ink-100">
                  {format(new Date(user.last_login), 'MMM d, yyyy HH:mm', { locale: dateLocale })}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
