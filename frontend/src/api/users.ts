import apiClient, { toApiError } from './client'
import type { UserOut } from '../types/api'

export async function getUsers(): Promise<UserOut[]> {
  try {
    const { data } = await apiClient.get<UserOut[]>('/users')
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
