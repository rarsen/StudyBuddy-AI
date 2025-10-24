import api from './api'

export const chatService = {
  async createSession(sessionData) {
    const response = await api.post('/chat/sessions', sessionData)
    return response.data
  },

  async getSessions(activeOnly = false) {
    const response = await api.get('/chat/sessions', {
      params: { active_only: activeOnly }
    })
    return response.data
  },

  async getSession(sessionId) {
    const response = await api.get(`/chat/sessions/${sessionId}`)
    return response.data
  },

  async updateSession(sessionId, updateData) {
    const response = await api.patch(`/chat/sessions/${sessionId}`, updateData)
    return response.data
  },

  async deleteSession(sessionId) {
    await api.delete(`/chat/sessions/${sessionId}`)
  },

  async sendMessage(messageData) {
    const response = await api.post('/chat/message', messageData)
    return response.data
  },

  async getSessionMessages(sessionId) {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`)
    return response.data
  }
}

