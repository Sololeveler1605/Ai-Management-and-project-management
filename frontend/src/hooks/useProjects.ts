import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/projects'
import type { ProjectCreate, ProjectUpdate } from '../types/api'
import { queryKeys } from './queryKeys'

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: () => api.getProjects(),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProjectCreate) => api.createProject(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdate }) =>
      api.updateProject(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  })
}

export function useAssignTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, userIds }: { projectId: string; userIds: string[] }) =>
      api.assignTeam(projectId, userIds),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.team(vars.projectId) })
      qc.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useTeam(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.team(projectId || ''),
    queryFn: () => api.getTeam(projectId!),
    enabled: Boolean(projectId),
  })
}
