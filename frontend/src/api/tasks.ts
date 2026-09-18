import apiClient, { toApiError } from './client'
import type { TaskCreate, TaskOut, TaskStatusUpdate, TaskUpdate } from '../types/api'

export async function getTasks(projectId?: string | null): Promise<TaskOut[]> {
  try {
    const { data } = await apiClient.get<TaskOut[]>('/tasks', {
      params: projectId ? { project_id: projectId } : undefined,
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createTask(payload: TaskCreate): Promise<TaskOut> {
  try {
    const { data } = await apiClient.post<TaskOut>('/tasks', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateTask(
  taskId: string,
  payload: TaskUpdate,
): Promise<TaskOut> {
  try {
    const { data } = await apiClient.patch<TaskOut>(`/tasks/${taskId}`, payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function patchStatus(
  taskId: string,
  payload: TaskStatusUpdate,
): Promise<TaskOut> {
  try {
    const { data } = await apiClient.patch<TaskOut>(
      `/tasks/${taskId}/status`,
      payload,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await apiClient.delete(`/tasks/${taskId}`)
  } catch (error) {
    throw toApiError(error)
  }
}
