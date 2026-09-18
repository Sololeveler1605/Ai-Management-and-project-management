import { useQuery } from '@tanstack/react-query'
import * as api from '../api/users'
import { queryKeys } from './queryKeys'

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => api.getUsers(),
    enabled,
  })
}
