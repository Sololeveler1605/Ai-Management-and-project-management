import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/weeklyReports'
import { queryKeys } from './queryKeys'

export function useWeeklyReports(projectId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.weeklyReports(projectId || ''),
    queryFn: () => api.listWeeklyReports(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useGenerateWeeklyReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (projectId: string) => api.generateWeeklyReport(projectId),
    onSuccess: (_data, projectId) => {
      qc.invalidateQueries({ queryKey: queryKeys.weeklyReports(projectId) })
    },
  })
}
