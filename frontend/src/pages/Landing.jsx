import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import ThemeToggle from '../components/ThemeToggle'
import LanguageSwitcher from '../components/LanguageSwitcher'

function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 shadow-glow flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3L2 8l10 5 10-5-10-5z" />
          <path d="M2 16l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-xl font-display font-bold tracking-tight text-ink-900 dark:text-ink-100">
        MindSpark <span className="gradient-text">AI</span>
      </span>
    </div>
  )
}

function Feature({ icon, title, desc, tone = 'primary' }) {
  const tones = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    sky: 'from-sky-500 to-cyan-600',
    rose: 'from-rose-500 to-pink-600',
  }
  return (
    <div className="group relative rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-6 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-md mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-display font-semibold text-ink-900 dark:text-ink-100 mb-2">{title}</h3>
      <p className="text-ink-600 dark:text-ink-300 leading-relaxed text-sm">{desc}</p>
    </div>
  )
}

function Step({ n, title, desc }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 text-white font-display font-bold text-lg flex items-center justify-center shadow-glow">
          {n}
        </div>
        <h3 className="text-xl font-display font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
      </div>
      <p className="text-ink-600 dark:text-ink-300 leading-relaxed pl-16">{desc}</p>
    </div>
  )
}

const FEATURE_TONES = ['primary', 'accent', 'emerald', 'amber', 'sky', 'rose']
const FEATURE_ICONS = [
  <svg key="0" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key="1" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  <svg key="2" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  <svg key="3" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.098 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.673z" /></svg>,
  <svg key="4" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  <svg key="5" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
]
const SUBJECT_KEYS = [
  'mathematics', 'physics', 'chemistry', 'biology',
  'computer_science', 'history', 'literature', 'language', 'economics',
]
const TRY_CARD_COLORS = [
  'from-primary-500 to-primary-700',
  'from-accent-500 to-accent-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
]

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  )
}

function Landing() {
  const { user } = useAuth()
  const { t } = useI18n()

  const stats = [
    ['10+', t('landing.stats.subjects')],
    ['24/7', t('landing.stats.available')],
    ['∞', t('landing.stats.questions')],
    ['< 3s', t('landing.stats.response')],
  ]
  const features = t('landing.features.items')
  const steps = t('landing.how.steps')
  const tryCards = t('landing.subjectsSection.cards')
  const faqItems = t('landing.faq.items')

  return (
    <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100 overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/75 dark:bg-ink-950/75 backdrop-blur-lg border-b border-ink-100 dark:border-ink-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-600 dark:text-ink-300">
            <a href="#features" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.nav.features')}</a>
            <a href="#how" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.nav.how')}</a>
            <a href="#subjects" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.nav.subjects')}</a>
            <a href="#faq" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.nav.faq')}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="btn btn-primary text-sm">
                {t('landing.nav.openDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost text-sm">{t('landing.nav.signIn')}</Link>
                <Link to="/register" className="btn btn-primary text-sm">{t('landing.nav.getStarted')}</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid bg-grid-mask opacity-70 dark:opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-300/40 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-accent-300/40 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 animate-fade-in-up">
              <span className="chip bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                {t('landing.hero.badge')}
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink-900 dark:text-ink-100">
                {t('landing.hero.titleLine1')}
                <span className="block gradient-text">{t('landing.hero.titleLine2')}</span>
              </h1>
              <p className="mt-6 text-lg text-ink-600 dark:text-ink-300 max-w-2xl leading-relaxed">
                {t('landing.hero.subtitle')}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="btn btn-primary text-base px-7 py-3.5">
                  {t('landing.hero.ctaPrimary')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/login" className="btn btn-secondary text-base px-7 py-3.5">
                  {t('landing.hero.ctaSecondary')}
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-ink-500 dark:text-ink-400">
                <div className="flex items-center gap-2">
                  <CheckIcon />
                  {t('landing.hero.noCard')}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <CheckIcon />
                  {t('landing.hero.freeStudents')}
                </div>
              </div>
            </div>

            {/* Chat mock */}
            <div className="lg:col-span-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary-400/30 to-accent-400/30 blur-2xl rounded-3xl" />
                <div className="relative rounded-3xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 shadow-glow-lg p-5">
                  <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-ink-500 dark:text-ink-400">mindspark.ai / chat</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-primary-600 to-accent-600 text-white px-4 py-3 text-sm shadow-md">
                        {t('landing.mock.user')}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-50 dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3 text-sm text-ink-800 dark:text-ink-200">
                        {t('landing.mock.aiIntro')}
                        <ul className="mt-2 ml-4 list-disc space-y-1 text-ink-700 dark:text-ink-300">
                          <li>{t('landing.mock.bullet1')}</li>
                          <li>{t('landing.mock.bullet2')}</li>
                          <li>{t('landing.mock.bullet3')}</li>
                        </ul>
                        <div className="mt-2 text-ink-500 dark:text-ink-400 text-xs">{t('landing.mock.aiFollowup')}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <div className="rounded-2xl rounded-tl-md bg-ink-50 dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5">
                    <input
                      readOnly
                      value={t('landing.mock.placeholder')}
                      className="flex-1 bg-transparent text-sm text-ink-400 dark:text-ink-500 outline-none cursor-default"
                    />
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-3xl bg-gradient-to-r from-primary-600 to-accent-600 p-8 text-white shadow-glow-lg">
            {stats.map(([n, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-3xl sm:text-4xl font-extrabold">{n}</div>
                <div className="text-white/80 text-sm mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="chip bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-500/20 mb-3">{t('landing.features.badge')}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              {t('landing.features.headingA')}<span className="gradient-text">{t('landing.features.headingHighlight')}</span>{t('landing.features.headingB')}
            </h2>
            <p className="mt-4 text-ink-600 dark:text-ink-300">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Feature
                key={f.title}
                tone={FEATURE_TONES[i]}
                title={f.title}
                desc={f.desc}
                icon={FEATURE_ICONS[i]}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-gradient-to-b from-ink-50 to-white dark:from-ink-900 dark:to-ink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="chip bg-accent-50 dark:bg-accent-500/10 text-accent-700 dark:text-accent-300 border border-accent-100 dark:border-accent-500/20 mb-3">{t('landing.how.badge')}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              {t('landing.how.heading')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <Step key={s.title} n={String(i + 1)} title={s.title} desc={s.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="chip bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 mb-3">{t('landing.subjectsSection.badge')}</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                {t('landing.subjectsSection.headingA')}<span className="gradient-text">{t('landing.subjectsSection.headingHighlight')}</span>
              </h2>
              <p className="text-ink-600 dark:text-ink-300 leading-relaxed mb-6">
                {t('landing.subjectsSection.paragraph')}
              </p>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_KEYS.map((key) => (
                  <span key={key} className="chip bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-primary-300 hover:text-primary-700 dark:hover:border-primary-500 dark:hover:text-primary-300 transition-colors">
                    {t(`subjects.${key}`)}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {tryCards.map((card, i) => (
                <div
                  key={card.t}
                  className={`rounded-2xl p-5 text-white bg-gradient-to-br ${TRY_CARD_COLORS[i]} shadow-soft ${
                    i % 2 ? 'sm:translate-y-6' : ''
                  }`}
                >
                  <div className="text-sm font-semibold opacity-80">{t('landing.subjectsSection.tryAsking')}</div>
                  <div className="font-display text-lg font-bold mt-1">{card.t}</div>
                  <div className="text-white/85 text-sm mt-2">{card.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-ink-50/60 dark:bg-ink-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="chip bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-500/20 mb-3">{t('landing.faq.badge')}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              {t('landing.faq.heading')}
            </h2>
          </div>

          <div className="space-y-3">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-5 shadow-soft open:shadow-glow transition-all">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-display font-semibold text-ink-900 dark:text-ink-100">{q}</span>
                  <svg className="w-5 h-5 text-ink-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-ink-600 dark:text-ink-300 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 px-8 py-16 sm:px-16 text-white shadow-glow-lg">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-400/30 blur-3xl" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                {t('landing.cta.heading')}
              </h2>
              <p className="mt-4 text-white/85 text-lg">
                {t('landing.cta.subtitle')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/register" className="btn bg-white text-primary-700 hover:bg-ink-50 text-base px-7 py-3.5 shadow-soft hover:-translate-y-0.5">
                  {t('landing.cta.primary')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/login" className="btn text-base px-7 py-3.5 border border-white/40 text-white hover:bg-white/10">
                  {t('landing.cta.secondary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 dark:border-ink-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="text-sm text-ink-500 dark:text-ink-400">
            © {new Date().getFullYear()} MindSpark · {t('landing.footer.tagline')}
          </div>
          <div className="flex items-center gap-5 text-sm text-ink-500 dark:text-ink-400">
            <a href="#features" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.footer.features')}</a>
            <a href="#faq" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.footer.faq')}</a>
            <Link to="/login" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">{t('landing.footer.signIn')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
