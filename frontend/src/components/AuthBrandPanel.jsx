import { Link } from 'react-router-dom'

function AuthBrandPanel({ title, subtitle, highlights = [] }) {
  return (
    <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-700 text-white">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-blob" />
      <div
        className="absolute -bottom-24 -right-10 w-96 h-96 rounded-full bg-accent-400/30 blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
      />

      <div className="relative flex flex-col justify-between w-full p-12">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L2 8l10 5 10-5-10-5z" />
              <path d="M2 16l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-display font-bold">MindSpark</span>
        </Link>

        <div>
          <h2 className="font-display text-4xl xl:text-5xl font-extrabold leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-5 text-white/85 text-lg max-w-md">{subtitle}</p>
          )}

          {highlights.length > 0 && (
            <ul className="mt-10 space-y-3 max-w-md">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-white/90">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-white/70 text-sm">
          Educational project · Made for students
        </div>
      </div>
    </div>
  )
}

export default AuthBrandPanel
