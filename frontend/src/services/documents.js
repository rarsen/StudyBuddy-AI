import api from './api'

export const documentsService = {
  async list() {
    const { data } = await api.get('/documents')
    return data
  },

  async get(id) {
    const { data } = await api.get(`/documents/${id}`)
    return data
  },

  async chunks(id, limit = 20) {
    const { data } = await api.get(`/documents/${id}/chunks`, { params: { limit } })
    return data
  },

  async upload(file, { title, subject } = {}, onProgress) {
    const form = new FormData()
    form.append('file', file)
    if (title) form.append('title', title)
    if (subject) form.append('subject', subject)

    const { data } = await api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    })
    return data
  },

  async remove(id) {
    await api.delete(`/documents/${id}`)
  },

  async search(query, { topK, documentIds } = {}) {
    const { data } = await api.post('/documents/search', {
      query,
      top_k: topK,
      document_ids: documentIds,
    })
    return data
  },
}
