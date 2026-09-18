import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/requirementAnalyzer'
import type { EpicOut } from '../types/api'
import { queryKeys } from './queryKeys'

export function useRequirementAnalysis(analysisId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.requirementAnalysis(analysisId || ''),
    queryFn: () => api.get(analysisId!),
    enabled: Boolean(analysisId),
  })
}

export function useAnalyzeRequirement() {
  return useMutation({
    mutationFn: ({ documentId, projectId }: { documentId: string; projectId: string }) =>
      api.analyze(documentId, projectId),
  })
}

export function useApproveRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ analysisId, epics }: { analysisId: string; epics: EpicOut[] }) =>
      api.approve(analysisId, epics),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.requirementAnalysis(vars.analysisId) })
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useRejectRequirement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (analysisId: string) => api.reject(analysisId),
    onSuccess: (_data, analysisId) => {
      qc.invalidateQueries({ queryKey: queryKeys.requirementAnalysis(analysisId) })
    },
  })
}
