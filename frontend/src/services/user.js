import api from './api'

export const userService = {
  async getProfile() {
    const response = await api.get('/users/me')
    return response.data
  },

  async updateProfile(updateData) {
    const response = await api.patch('/users/me', updateData)
    return response.data
  }
}

