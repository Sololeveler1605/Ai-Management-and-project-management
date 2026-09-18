import type { ChatResponse } from '../types/api'
import apiClient, { toApiError } from './client'

export async function askAiChat(
  message: string,
  documentIds?: string[] | null,
  projectId?: string | null,
): Promise<ChatResponse> {
  try {
    const { data } = await apiClient.post<ChatResponse>('/chat/query', {
      message,
      ...(documentIds?.length ? { document_ids: documentIds } : {}),
      ...(projectId ? { project_id: projectId } : {}),
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
