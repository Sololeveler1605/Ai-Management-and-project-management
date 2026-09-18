import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/meetings'
import type { MeetingSummaryOut } from '../types/api'
import { queryKeys } from './queryKeys'

export function useMeetingsByProjects(
  projectIds: string[],
  projectNames: Record<string, string>,
) {
  const results = useQueries({
    queries: projectIds.map((pid) => ({
      queryKey: queryKeys.meetings(pid),
      queryFn: () => api.listByProject(pid),
      enabled: Boolean(pid),
    })),
  })

  const isLoading = results.some((r) => r.isLoading)
  const isFetching = results.some((r) => r.isFetching)
  const error = results.find((r) => r.error)?.error ?? null

  const meetings: (MeetingSummaryOut & { _project_name: string })[] = []
  results.forEach((r, i) => {
    const pid = projectIds[i]
    if (!r.data) return
    for (const m of r.data) {
      meetings.push({
        ...m,
        _project_name: projectNames[pid] || String(pid).slice(0, 8),
      })
    }
  })
  meetings.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))

  return {
    meetings,
    isLoading,
    isFetching,
    error,
    refetchAll: () => Promise.all(results.map((r) => r.refetch())),
  }
}

export function useUploadMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, file }: { projectId: string; file: File }) =>
      api.uploadMeeting(projectId, file),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.meetings(vars.projectId) })
    },
  })
}
