import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/user'
import Layout from '../components/Layout'
import { format } from 'date-fns'

function Profile() {
  const { user, updateUser } = useAuth()
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
        setError('Password must be at least 8 characters')
        setLoading(false)
        return
      }
      updateData.password = formData.password
    }

    if (Object.keys(updateData).length === 0) {
      setError('No changes to save')
      setLoading(false)
      return
    }

    try {
      const updatedUser = await userService.updateProfile(updateData)
      updateUser(updatedUser)
      setSuccess('Profile updated successfully!')
      setEditing(false)
      setFormData({ ...formData, password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile')
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
                  {user?.is_active ? 'Active' : 'Inactive'}
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
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm animate-fade-in">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Account info */}
        <div className="mt-8 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-900">Account information</h2>
              <p className="text-sm text-ink-500">Update your personal details</p>
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
                Edit profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-ink-800 mb-1.5">Email</label>
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
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3 text-ink-900">
                    {user?.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-800 mb-1.5">Username</label>
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
                  <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3 text-ink-900">
                    {user?.username}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-800 mb-1.5">Full name</label>
              {editing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                />
              ) : (
                <div className="rounded-xl border border-ink-100 bg-ink-50/50 px-4 py-3 text-ink-900">
                  {user?.full_name || <span className="text-ink-400">Not provided</span>}
                </div>
              )}
            </div>

            {editing && (
              <div>
                <label className="block text-sm font-semibold text-ink-800 mb-1.5">New password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Leave empty to keep current password"
                  minLength="8"
                />
                <p className="mt-1.5 text-xs text-ink-500">
                  Minimum 8 characters. Leave empty to keep current password.
                </p>
              </div>
            )}

            {editing && (
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account details */}
        <div className="mt-6 card">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Account details</h2>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-ink-100">
              <dt className="text-ink-500">Status</dt>
              <dd className={`font-semibold ${user?.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </dd>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100">
              <dt className="text-ink-500">Role</dt>
              <dd className="font-semibold text-ink-900 capitalize">{user?.role}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-ink-100">
              <dt className="text-ink-500">Member since</dt>
              <dd className="font-semibold text-ink-900">
                {user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
              </dd>
            </div>
            {user?.last_login && (
              <div className="flex justify-between py-2 border-b border-ink-100">
                <dt className="text-ink-500">Last login</dt>
                <dd className="font-semibold text-ink-900">
                  {format(new Date(user.last_login), 'MMM d, yyyy HH:mm')}
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
