import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">StudyBuddy AI</span>
              </Link>
              
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  New Chat
                </Link>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              
              <Link
                to="/profile"
                className="btn btn-secondary text-sm"
              >
                Profile
              </Link>
              
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>

            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                className="block px-4 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                New Chat
              </Link>
              <Link
                to="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-4">
                <div className="text-sm font-medium text-gray-500">Signed in as</div>
                <div className="text-base font-medium text-gray-900">{user?.username}</div>
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

