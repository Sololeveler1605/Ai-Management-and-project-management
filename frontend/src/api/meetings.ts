import apiClient, { toApiError } from './client'
import type { MeetingSummaryOut, MeetingUploadResponse } from '../types/api'

export async function uploadMeeting(
  projectId: string,
  file: File,
): Promise<MeetingUploadResponse> {
  try {
    const form = new FormData()
    form.append('file', file)
    form.append('project_id', projectId)
    const { data } = await apiClient.post<MeetingUploadResponse>(
      '/meetings/upload',
      form,
      { timeout: 180_000 },
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getMeeting(meetingId: string): Promise<MeetingSummaryOut> {
  try {
    const { data } = await apiClient.get<MeetingSummaryOut>(
      `/meetings/${meetingId}`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listByProject(
  projectId: string,
): Promise<MeetingSummaryOut[]> {
  try {
    const { data } = await apiClient.get<MeetingSummaryOut[]>(
      `/meetings/project/${projectId}`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
