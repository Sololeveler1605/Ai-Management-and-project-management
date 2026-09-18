const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('ai_project_os_token')
  const headers = new Headers(options.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw new ApiError(data?.detail || data?.message || `Request failed (${response.status})`, response.status)
  return data
}

export const api = {
  baseUrl: API_BASE_URL,
  health: () => request('/'),
  login: (email, password) => {
    const body = new URLSearchParams({ username: email, password })
    return request('/auth/login', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  users: () => request('/users'),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  clients: () => request('/clients'),
  createClient: (payload) => request('/clients', { method: 'POST', body: JSON.stringify(payload) }),
  updateClient: (id, payload) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),
  projects: () => request('/projects'),
  createProject: (payload) => request('/projects', { method: 'POST', body: JSON.stringify(payload) }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  team: (id) => request(`/projects/${id}/team`),
  assignTeam: (id, user_ids) => request(`/projects/${id}/team`, { method: 'PUT', body: JSON.stringify({ user_ids }) }),
  tasks: (projectId) => request(`/tasks${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`),
  createTask: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  updateTaskStatus: (id, payload) => request(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  taskDetail: (id) => request(`/tasks/${id}`),
  subtasks: (id) => request(`/tasks/${id}/subtasks`),
  createSubtask: (id, payload) => request(`/tasks/${id}/subtasks`, { method: 'POST', body: JSON.stringify(payload) }),
  comments: (id) => request(`/tasks/${id}/comments`),
  addComment: (id, body) => request(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),
  links: (id) => request(`/tasks/${id}/links`),
  addLink: (id, linked_task_id, link_type) => request(`/tasks/${id}/links`, { method: 'POST', body: JSON.stringify({ linked_task_id, link_type }) }),
  removeLink: (id, linkId) => request(`/tasks/${id}/links/${linkId}`, { method: 'DELETE' }),
  documents: (projectId) => request(`/documents${projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''}`),
  uploadDocument: (file, projectId) => { const form = new FormData(); form.append('file', file); if (projectId) form.append('project_id', projectId); return request('/documents/upload', { method: 'POST', body: form }) },
  downloadDocument: async (id, filename) => { const token = localStorage.getItem('ai_project_os_token'); const res = await fetch(`${API_BASE_URL}/documents/${id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!res.ok) throw new ApiError('Download failed', res.status); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename || 'download'; a.click(); URL.revokeObjectURL(url) },
  previewDocument: async (id, filename = 'Document') => { const token = localStorage.getItem('ai_project_os_token'); const res = await fetch(`${API_BASE_URL}/documents/${id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : {} }); if (!res.ok) throw new ApiError('Preview failed', res.status); const detail = { id, filename, url: URL.createObjectURL(await res.blob()), contentType: res.headers.get('content-type') }; window.dispatchEvent(new CustomEvent('document-preview', { detail })); return detail },
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
  reindexDocument: (id) => request(`/documents/${id}/reindex`, { method: 'POST' }),
  modules: (projectId) => request(`/projects/${projectId}/modules`),
  createModule: (projectId, payload) => request(`/projects/${projectId}/modules`, { method: 'POST', body: JSON.stringify(payload) }),
  insertModule: (projectId, position, payload) => request(`/projects/${projectId}/modules/insert-at/${position}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateModule: (id, payload) => request(`/modules/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteModule: (id) => request(`/modules/${id}`, { method: 'DELETE' }),
  reorderModules: (projectId, ordered_ids) => request(`/projects/${projectId}/modules/reorder`, { method: 'POST', body: JSON.stringify({ ordered_ids }) }),
  clientDashboard: () => request('/client-dashboard'),
  reports: (projectId) => request(`/weekly-reports/${projectId}`),
  generateReport: (projectId) => request(`/weekly-reports/${projectId}`, { method: 'POST' }),
  meetings: (projectId) => request(`/meetings/project/${projectId}`),
  uploadMeeting: (file, projectId) => { const form = new FormData(); form.append('file', file); form.append('project_id', projectId); return request('/meetings/upload', { method: 'POST', body: form }) },
  aiStatus: () => request('/ai/status'),
  generateTasks: (payload) => request('/ai/generate-tasks', { method: 'POST', body: JSON.stringify(payload) }),
  analyzeRequirement: (payload) => request('/ai/analyze-requirement', { method: 'POST', body: JSON.stringify(payload) }),
  getAnalysis: (id) => request(`/ai/requirement-analyses/${id}`),
  approveAnalysis: (id, epics) => request(`/ai/requirement-analyses/${id}/approve`, { method: 'POST', body: JSON.stringify({ epics }) }),
  rejectAnalysis: (id) => request(`/ai/requirement-analyses/${id}/reject`, { method: 'POST' }),
  chat: (message, document_ids, project_id) => request('/chat/query', { method: 'POST', body: JSON.stringify({ message, ...(document_ids?.length ? { document_ids } : {}), ...(project_id ? { project_id } : {}) }) }),
}
