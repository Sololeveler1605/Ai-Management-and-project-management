import apiClient, { toApiError } from './client'
import type { ClientDashboardOut } from '../types/api'

export async function getClientDashboard(): Promise<ClientDashboardOut[]> {
  try {
    const { data } = await apiClient.get<ClientDashboardOut[]>('/client-dashboard')
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
