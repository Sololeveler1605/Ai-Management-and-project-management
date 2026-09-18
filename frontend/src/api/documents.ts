import type { DocumentOut, ReindexResult } from '../types/api'
import apiClient, { API_BASE_URL, ApiError, toApiError } from './client'

function authHeader(): HeadersInit {
  const token =
    localStorage.getItem('ai_project_os_token') ||
    sessionStorage.getItem('ai_project_os_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function listDocuments(projectId?: string): Promise<DocumentOut[]> {
  try {
    const { data } = await apiClient.get<DocumentOut[]>('/documents', {
      params: projectId ? { project_id: projectId } : undefined,
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    await apiClient.delete(`/documents/${id}`)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function reindexDocument(id: string): Promise<ReindexResult> {
  try {
    const { data } = await apiClient.post<ReindexResult>(`/documents/${id}/reindex`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function uploadDocument(file: File, projectId?: string | null): Promise<DocumentOut> {
  try {
    const form = new FormData()
    form.append('file', file)
    if (projectId) form.append('project_id', projectId)
    const { data } = await apiClient.post<DocumentOut>('/documents/upload', form)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function downloadDocumentBlob(
  id: string,
): Promise<{ blob: Blob; contentType: string | null }> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    headers: authHeader(),
  })
  if (!res.ok) throw new ApiError('Download failed', res.status)
  return { blob: await res.blob(), contentType: res.headers.get('content-type') }
}

export async function downloadDocument(id: string, filename?: string): Promise<void> {
  const { blob } = await downloadDocumentBlob(id)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'download'
  a.click()
  URL.revokeObjectURL(url)
}

export async function previewDocument(
  id: string,
  filename = 'Document',
): Promise<{ id: string; filename: string; url: string; contentType: string | null }> {
  const { blob, contentType } = await downloadDocumentBlob(id)
  const detail = {
    id,
    filename,
    url: URL.createObjectURL(blob),
    contentType,
  }
  window.dispatchEvent(new CustomEvent('document-preview', { detail }))
  return detail
}
