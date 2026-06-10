import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { chatService } from '../services/chat'
import Layout from '../components/Layout'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'

// Visual styling per subject; the human-readable label is resolved via i18n.
const SUBJECT_META = {
  mathematics: { tone: 'from-blue-500 to-indigo-600', chip: 'bg-blue-50 text-blue-700 border-blue-100', emoji: '📐' },
  physics: { tone: 'from-purple-500 to-fuchsia-600', chip: 'bg-purple-50 text-purple-700 border-purple-100', emoji: '⚛️' },
  chemistry: { tone: 'from-emerald-500 to-teal-600', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', emoji: '🧪' },
  biology: { tone: 'from-green-500 to-emerald-600', chip: 'bg-green-50 text-green-700 border-green-100', emoji: '🧬' },
  computer_science: { tone: 'from-indigo-500 to-violet-600', chip: 'bg-indigo-50 text-indigo-700 border-indigo-100', emoji: '💻' },
  history: { tone: 'from-amber-500 to-orange-600', chip: 'bg-amber-50 text-amber-700 border-amber-100', emoji: '🏛️' },
  literature: { tone: 'from-pink-500 to-rose-600', chip: 'bg-pink-50 text-pink-700 border-pink-100', emoji: '📖' },
  language: { tone: 'from-cyan-500 to-sky-600', chip: 'bg-cyan-50 text-cyan-700 border-cyan-100', emoji: '🗣️' },
  economics: { tone: 'from-orange-500 to-amber-600', chip: 'bg-orange-50 text-orange-700 border-orange-100', emoji: '📊' },
  other: { tone: 'from-slate-500 to-gray-600', chip: 'bg-slate-50 text-slate-700 border-slate-100', emoji: '✨' },
}

const metaFor = (s) => SUBJECT_META[s] || SUBJECT_META.other
const subjectKeyOf = (s) => (SUBJECT_META[s] ? s : 'other')

function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const { user } = useAuth()
  const { t, tc, lang } = useI18n()
  const dateLocale = lang === 'uk' ? uk : undefined
  const navigate = useNavigate()
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (user && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadSessions()
    }
  }, [user])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await chatService.getSessions(true)
      setSessions(data || [])
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to load sessions:', err)
      }
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const startNewChat = () => navigate('/chat')

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || s.title.toLowerCase().includes(q)
      const matchS = subjectFilter === 'all' || s.subject === subjectFilter
      return matchQ && matchS
    })
  }, [sessions, query, subjectFilter])

  const subjectsInUse = useMemo(() => {
    const set = new Set(sessions.map((s) => s.subject))
    return Array.from(set)
  }, [sessions])

  const totalMessages = sessions.reduce((n, s) => n + (s.message_count || 0), 0)
  const firstName = (user?.full_name || user?.username || '').split(' ')[0]

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white p-8 sm:p-10 shadow-glow-lg animate-fade-in-up">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-accent-300/30 blur-3xl animate-blob" style={{ animationDelay: '2s' }} />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="chip bg-white/15 text-white border border-white/20 backdrop-blur-sm mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                {t('dashboard.badge')}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold">
                {firstName ? t('dashboard.welcomeNamed', { name: firstName }) : t('dashboard.welcome')}
              </h1>
              <p className="mt-2 text-white/85 text-lg max-w-xl">
                {t('dashboard.subtitle')}
              </p>
            </div>

            <button
              onClick={startNewChat}
              className="btn bg-white text-primary-700 hover:bg-ink-50 text-base px-6 py-3 shadow-soft hover:-translate-y-0.5 self-start"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {t('dashboard.startNew')}
            </button>
          </div>

          <div className="relative mt-8 grid grid-cols-3 gap-4 max-w-xl">
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-4">
              <div className="text-2xl font-display font-extrabold">{sessions.length}</div>
              <div className="text-xs text-white/75 mt-0.5">{t('dashboard.statSessions')}</div>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-4">
              <div className="text-2xl font-display font-extrabold">{totalMessages}</div>
              <div className="text-xs text-white/75 mt-0.5">{t('dashboard.statMessages')}</div>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm p-4">
              <div className="text-2xl font-display font-extrabold">{subjectsInUse.length}</div>
              <div className="text-xs text-white/75 mt-0.5">{t('dashboard.statSubjects')}</div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">{t('dashboard.heading')}</h2>

            {sessions.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('dashboard.searchPlaceholder')}
                    className="input pl-9 py-2 w-full sm:w-64"
                  />
                </div>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="input py-2 w-full sm:w-auto"
                >
                  <option value="all">{t('dashboard.allSubjects')}</option>
                  {subjectsInUse.map((s) => (
                    <option key={s} value={s}>{t(`subjects.${subjectKeyOf(s)}`)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 bg-ink-100 dark:bg-ink-800 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-ink-100 dark:bg-ink-800 rounded w-1/3 mb-6" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-1/4" />
                    <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 px-4 py-3">
              {error}
            </div>
          ) : sessions.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-12 text-center">
              <div className="absolute inset-0 bg-radial-fade opacity-70 pointer-events-none" />
              <div className="relative">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink-900 dark:text-ink-100">
                  {t('dashboard.emptyTitle')}
                </h3>
                <p className="mt-2 text-ink-600 dark:text-ink-300 max-w-md mx-auto">
                  {t('dashboard.emptyDesc')}
                </p>
                <button onClick={startNewChat} className="btn btn-primary mt-6">
                  {t('dashboard.emptyCta')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-10 text-center text-ink-600 dark:text-ink-300">
              {t('dashboard.noMatch')}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((session) => {
                const m = metaFor(session.subject)
                return (
                  <Link
                    key={session.id}
                    to={`/chat/${session.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className={`h-1.5 w-full bg-gradient-to-r ${m.tone}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${m.tone} text-white flex items-center justify-center text-lg shadow-sm`}>
                          {m.emoji}
                        </div>
                        <span className={`chip border ${m.chip}`}>{t(`subjects.${subjectKeyOf(session.subject)}`)}</span>
                      </div>

                      <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-100 line-clamp-2 min-h-[2.75rem] group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                        {session.title}
                      </h3>

                      <div className="mt-5 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {tc('dashboard.messagesCount', session.message_count || 0)}
                        </span>
                        <span>
                          {formatDistanceToNow(new Date(session.updated_at || session.created_at), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
