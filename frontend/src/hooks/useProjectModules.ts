import { useQueries, useQuery } from '@tanstack/react-query'
import * as api from '../api/projects'
import type { ProjectModuleOut } from '../types/api'
import { queryKeys } from './queryKeys'

export function useProjectModules(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.modules(projectId || ''),
    queryFn: () => api.getProjectModules(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useModulesForProjects(projectIds: string[]) {
  const results = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: queryKeys.modules(pid),
      queryFn: () => api.getProjectModules(pid),
      enabled: Boolean(pid),
    })),
  })

  const modulesByProject: Record<string, ProjectModuleOut[]> = {}
  results.forEach((r, i) => {
    if (r.data) modulesByProject[projectIds[i]] = r.data
  })

  return {
    modulesByProject,
    isLoading: results.some((r) => r.isLoading),
    error: results.find((r) => r.error)?.error ?? null,
  }
}
