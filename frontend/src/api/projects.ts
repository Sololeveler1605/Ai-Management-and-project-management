import apiClient, { toApiError } from './client'
import type {
  ProjectCreate,
  ProjectModuleCreate,
  ProjectModuleOut,
  ProjectModuleUpdate,
  ProjectOut,
  ProjectUpdate,
  UserOut,
} from '../types/api'

export async function getProjects(): Promise<ProjectOut[]> {
  try {
    const { data } = await apiClient.get<ProjectOut[]>('/projects')
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createProject(payload: ProjectCreate): Promise<ProjectOut> {
  try {
    const { data } = await apiClient.post<ProjectOut>('/projects', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateProject(
  projectId: string,
  payload: ProjectUpdate,
): Promise<ProjectOut> {
  try {
    const { data } = await apiClient.patch<ProjectOut>(
      `/projects/${projectId}`,
      payload,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function assignTeam(
  projectId: string,
  userIds: string[],
): Promise<string[]> {
  try {
    const { data } = await apiClient.put<string[]>(`/projects/${projectId}/team`, {
      user_ids: userIds,
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getTeam(projectId: string): Promise<UserOut[]> {
  try {
    const { data } = await apiClient.get<UserOut[]>(`/projects/${projectId}/team`)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

// ---------- Project modules ----------

export async function getProjectModules(
  projectId: string,
): Promise<ProjectModuleOut[]> {
  try {
    const { data } = await apiClient.get<ProjectModuleOut[]>(
      `/projects/${projectId}/modules`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createProjectModule(
  projectId: string,
  payload: ProjectModuleCreate,
): Promise<ProjectModuleOut> {
  try {
    const { data } = await apiClient.post<ProjectModuleOut>(
      `/projects/${projectId}/modules`,
      payload,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateProjectModule(
  moduleId: string,
  payload: ProjectModuleUpdate,
): Promise<ProjectModuleOut> {
  try {
    const { data } = await apiClient.patch<ProjectModuleOut>(
      `/modules/${moduleId}`,
      payload,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteProjectModule(moduleId: string): Promise<void> {
  try {
    await apiClient.delete(`/modules/${moduleId}`)
  } catch (error) {
    throw toApiError(error)
  }
}

export async function reorderProjectModules(
  projectId: string,
  orderedIds: string[],
): Promise<{ ok: boolean }> {
  try {
    const { data } = await apiClient.post<{ ok: boolean }>(
      `/projects/${projectId}/modules/reorder`,
      { ordered_ids: orderedIds },
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
