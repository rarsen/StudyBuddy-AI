import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react'

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 shadow-glow flex items-center justify-center">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3L2 8l10 5 10-5-10-5z" />
          <path d="M2 16l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-lg font-display font-bold tracking-tight text-ink-900">
        MindSpark <span className="gradient-text">AI</span>
      </span>
    </Link>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'text-primary-700 bg-primary-50'
          : 'text-ink-600 hover:text-primary-700 hover:bg-ink-50'
      }`}
    >
      {children}
    </Link>
  )
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.full_name || user?.username || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 to-white">
      <nav className="sticky top-0 z-40 glass border-b border-ink-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Logo />
              <div className="hidden sm:flex items-center gap-1">
                <NavLink to="/dashboard" active={isActive('/dashboard')}>
                  Dashboard
                </NavLink>
                <NavLink to="/chat" active={location.pathname === '/chat' || location.pathname.startsWith('/chat/')}>
                  New chat
                </NavLink>
                <NavLink to="/documents" active={isActive('/documents')}>
                  Materials
                </NavLink>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/chat"
                className="hidden sm:inline-flex btn btn-primary text-sm py-2 px-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New session
              </Link>

              <div className="relative hidden sm:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl pl-1.5 pr-3 py-1.5 hover:bg-ink-100/70 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white font-bold text-sm flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-ink-800">{user?.username}</span>
                  <svg className="w-4 h-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-ink-100 shadow-glow py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-ink-100">
                      <div className="text-xs text-ink-500">Signed in as</div>
                      <div className="text-sm font-semibold text-ink-900 truncate">
                        {user?.full_name || user?.username}
                      </div>
                      <div className="text-xs text-ink-500 truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <svg className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                    >
                      <svg className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-ink-100 mt-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="sm:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-ink-100 bg-white">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-800 hover:bg-ink-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-800 hover:bg-ink-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                New chat
              </Link>
              <Link
                to="/documents"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-800 hover:bg-ink-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Materials
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-800 hover:bg-ink-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Log out
              </button>
            </div>
            <div className="px-4 py-3 border-t border-ink-100 bg-ink-50">
              <div className="text-xs text-ink-500">Signed in as</div>
              <div className="text-sm font-semibold text-ink-900">
                {user?.full_name || user?.username}
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>
    </div>
  )
}

export default Layout
