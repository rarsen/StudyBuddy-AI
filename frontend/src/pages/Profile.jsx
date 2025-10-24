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
    password: ''
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      password: ''
    })
    setEditing(false)
    setError('')
    setSuccess('')
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-6">Account Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
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
                <p className="text-gray-900 py-2">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
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
                <p className="text-gray-900 py-2">{user?.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.full_name || 'Not provided'}</p>
              )}
            </div>

            {editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Leave empty to keep current password"
                  minLength="8"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters. Leave empty to keep current password.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Account Status</span>
              <span className={`font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Role</span>
              <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Member Since</span>
              <span className="font-medium text-gray-900">
                {user?.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
            {user?.last_login && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(user.last_login), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Profile

