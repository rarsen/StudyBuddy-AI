import api from './api'

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  setAuth(token, user) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  getToken() {
    return localStorage.getItem('token')
  }
}

