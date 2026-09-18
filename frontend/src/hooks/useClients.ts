import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/clients'
import type { ClientCreate, ClientUpdate } from '../types/api'
import { queryKeys } from './queryKeys'

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => api.getClients(),
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ClientCreate) => api.createClient(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClientUpdate }) =>
      api.updateClient(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients }),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteClient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients }),
  })
}
