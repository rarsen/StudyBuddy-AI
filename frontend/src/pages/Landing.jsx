import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      <span className="text-xl font-display font-bold tracking-tight text-ink-900">
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
    <div className="group relative rounded-2xl bg-white border border-ink-100 p-6 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-md mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-display font-semibold text-ink-900 mb-2">{title}</h3>
      <p className="text-ink-600 leading-relaxed text-sm">{desc}</p>
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
        <h3 className="text-xl font-display font-semibold text-ink-900">{title}</h3>
      </div>
      <p className="text-ink-600 leading-relaxed pl-16">{desc}</p>
    </div>
  )
}

function Landing() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white text-ink-900 overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-lg border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-600">
            <a href="#features" className="hover:text-primary-700 transition-colors">Features</a>
            <a href="#how" className="hover:text-primary-700 transition-colors">How it works</a>
            <a href="#subjects" className="hover:text-primary-700 transition-colors">Subjects</a>
            <a href="#faq" className="hover:text-primary-700 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary text-sm">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid bg-grid-mask opacity-70 pointer-events-none" />
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-300/40 blur-3xl animate-blob pointer-events-none" />
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-accent-300/40 blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 animate-fade-in-up">
              <span className="chip bg-primary-50 text-primary-700 border border-primary-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                AI-powered learning, built for students
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-ink-900">
                Your personal AI tutor
                <span className="block gradient-text">that actually explains things.</span>
              </h1>
              <p className="mt-6 text-lg text-ink-600 max-w-2xl leading-relaxed">
                MindSpark helps you understand tough topics, prepare for exams, and keep your
                study sessions organized — across math, physics, history, languages and more.
                Ask anything, any time, and get clear step-by-step explanations.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="btn btn-primary text-base px-7 py-3.5">
                  Start learning free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/login" className="btn btn-secondary text-base px-7 py-3.5">
                  I already have an account
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-ink-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card needed
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free for students
                </div>
              </div>
            </div>

            {/* Chat mock */}
            <div className="lg:col-span-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary-400/30 to-accent-400/30 blur-2xl rounded-3xl" />
                <div className="relative rounded-3xl bg-white border border-ink-100 shadow-glow-lg p-5">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-ink-500">mindspark.ai / chat</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gradient-to-br from-primary-600 to-accent-600 text-white px-4 py-3 text-sm shadow-md">
                        Can you explain how photosynthesis actually works?
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-50 border border-ink-100 px-4 py-3 text-sm text-ink-800">
                        Of course! Photosynthesis is how plants turn sunlight into food. Here's the short version:
                        <ul className="mt-2 ml-4 list-disc space-y-1 text-ink-700">
                          <li>Leaves absorb light with <b>chlorophyll</b></li>
                          <li>Roots pull up water, pores take in CO₂</li>
                          <li>The plant makes <b>glucose</b> and releases oxygen</li>
                        </ul>
                        <div className="mt-2 text-ink-500 text-xs">Want me to go deeper on the Calvin cycle?</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <div className="rounded-2xl rounded-tl-md bg-ink-50 border border-ink-100 px-4 py-3">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2.5">
                    <input
                      readOnly
                      value="Ask anything about your studies…"
                      className="flex-1 bg-transparent text-sm text-ink-400 outline-none cursor-default"
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
            {[
              ['10+', 'Subjects supported'],
              ['24/7', 'Always available'],
              ['∞', 'Unlimited questions'],
              ['< 3s', 'Typical response'],
            ].map(([n, l]) => (
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
            <span className="chip bg-primary-50 text-primary-700 border border-primary-100 mb-3">Why MindSpark</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Built to help you <span className="gradient-text">actually learn</span>, not just copy answers.
            </h2>
            <p className="mt-4 text-ink-600">
              MindSpark is designed as a tutor — it explains reasoning, adapts to your level,
              and keeps track of everything you study so you can come back and pick up where you left off.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature
              tone="primary"
              title="Step-by-step explanations"
              desc="Ask for the answer and get the reasoning too — broken down in clear, numbered steps you can follow."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <Feature
              tone="accent"
              title="Organized study sessions"
              desc="Every conversation is saved and tagged by subject, so you can rebuild your notes any time."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            <Feature
              tone="emerald"
              title="Works across subjects"
              desc="Math, physics, chemistry, biology, CS, history, languages, economics and more — one tutor for everything."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <Feature
              tone="amber"
              title="Exam-ready practice"
              desc="Ask for practice questions, worked examples, or flash-card-style quick reviews before a test."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.098 10.1c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.518-4.673z" />
                </svg>
              }
            />
            <Feature
              tone="sky"
              title="Remembers context"
              desc="Each session remembers what you were discussing — follow-ups make sense instead of starting from zero."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              }
            />
            <Feature
              tone="rose"
              title="Private by default"
              desc="Your account is yours. Chats are stored under your profile so only you can see your study history."
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 bg-gradient-to-b from-ink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="chip bg-accent-50 text-accent-700 border border-accent-100 mb-3">How it works</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Three steps to a smarter study session
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <Step
              n="1"
              title="Create your account"
              desc="Sign up in seconds with email and password. Your profile keeps your sessions in one place."
            />
            <Step
              n="2"
              title="Start a study session"
              desc="Ask a question — anything from 'help me understand integrals' to 'quiz me on the French Revolution'."
            />
            <Step
              n="3"
              title="Learn, review, revisit"
              desc="Every chat is saved, searchable and organized by subject, so revision is just one click away."
            />
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="chip bg-emerald-50 text-emerald-700 border border-emerald-100 mb-3">Subjects</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                One tutor. <span className="gradient-text">Every subject.</span>
              </h2>
              <p className="text-ink-600 leading-relaxed mb-6">
                Whether you're stuck on calculus homework, writing an essay on WWII, debugging a
                Python program, or trying to memorize Spanish verbs — MindSpark adapts to the
                subject and meets you at your level.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Mathematics', 'Physics', 'Chemistry', 'Biology',
                  'Computer Science', 'History', 'Literature', 'Languages',
                  'Economics',
                ].map((s) => (
                  <span key={s} className="chip bg-white border border-ink-200 text-ink-700 hover:border-primary-300 hover:text-primary-700 transition-colors">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { t: 'Explain like I\'m 12', s: 'Any topic, plain language.', c: 'from-primary-500 to-primary-700' },
                { t: 'Solve with steps', s: 'Never just the final answer.', c: 'from-accent-500 to-accent-700' },
                { t: 'Quiz me', s: 'Practice questions on demand.', c: 'from-emerald-500 to-teal-600' },
                { t: 'Summarize', s: 'Turn a chapter into notes.', c: 'from-amber-500 to-orange-600' },
              ].map(({ t, s, c }, i) => (
                <div
                  key={t}
                  className={`rounded-2xl p-5 text-white bg-gradient-to-br ${c} shadow-soft ${
                    i % 2 ? 'sm:translate-y-6' : ''
                  }`}
                >
                  <div className="text-sm font-semibold opacity-80">Try asking:</div>
                  <div className="font-display text-lg font-bold mt-1">{t}</div>
                  <div className="text-white/85 text-sm mt-2">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-ink-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="chip bg-primary-50 text-primary-700 border border-primary-100 mb-3">FAQ</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">
              Questions we hear a lot
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Is MindSpark free?',
                a: 'Yes — creating an account and using MindSpark for your studies is free. No credit card required.',
              },
              {
                q: 'What can I ask it?',
                a: 'Anything in the subjects we support: explanations, worked examples, summaries, practice questions, definitions, essay outlines, code help, and more.',
              },
              {
                q: 'Will it just give me the answer?',
                a: 'MindSpark is designed as a tutor, so it prefers to walk you through reasoning step by step. You\'ll actually learn, not just copy.',
              },
              {
                q: 'Are my conversations private?',
                a: 'Your sessions are stored under your account and only visible to you. You can delete any session from your dashboard.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl bg-white border border-ink-100 p-5 shadow-soft open:shadow-glow transition-all">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <span className="font-display font-semibold text-ink-900">{q}</span>
                  <svg className="w-5 h-5 text-ink-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-ink-600 leading-relaxed">{a}</p>
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
                Ready to study smarter?
              </h2>
              <p className="mt-4 text-white/85 text-lg">
                Create a free account and start your first session in under a minute.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/register" className="btn bg-white text-primary-700 hover:bg-ink-50 text-base px-7 py-3.5 shadow-soft hover:-translate-y-0.5">
                  Create free account
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/login" className="btn text-base px-7 py-3.5 border border-white/40 text-white hover:bg-white/10">
                  Sign in instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <div className="text-sm text-ink-500">
            © {new Date().getFullYear()} MindSpark · Educational project
          </div>
          <div className="flex items-center gap-5 text-sm text-ink-500">
            <a href="#features" className="hover:text-primary-700 transition-colors">Features</a>
            <a href="#faq" className="hover:text-primary-700 transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-primary-700 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
