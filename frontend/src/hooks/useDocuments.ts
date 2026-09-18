import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/documents'
import { queryKeys } from './queryKeys'

export function useDocuments(projectId?: string | null) {
  return useQuery({
    queryKey: queryKeys.documents(projectId),
    queryFn: () => api.listDocuments(projectId || undefined),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, projectId }: { file: File; projectId?: string | null }) =>
      api.uploadDocument(file, projectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useReindexDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.reindexDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}
