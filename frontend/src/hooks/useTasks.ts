import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/tasks'
import type { TaskCreate, TaskStatusUpdate, TaskUpdate } from '../types/api'
import { queryKeys } from './queryKeys'

export function useTasks(projectId?: string | null) {
  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: () => api.getTasks(projectId),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskCreate) => api.createTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdate }) =>
      api.updateTask(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function usePatchTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskStatusUpdate }) =>
      api.patchStatus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
