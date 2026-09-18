import apiClient, { toApiError } from './client'
import type { ClientCreate, ClientOut, ClientUpdate } from '../types/api'

export async function getClients(): Promise<ClientOut[]> {
  try {
    const { data } = await apiClient.get<ClientOut[]>('/clients')
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createClient(payload: ClientCreate): Promise<ClientOut> {
  try {
    const { data } = await apiClient.post<ClientOut>('/clients', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateClient(
  clientId: string,
  payload: ClientUpdate,
): Promise<ClientOut> {
  try {
    const { data } = await apiClient.put<ClientOut>(`/clients/${clientId}`, payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteClient(clientId: string): Promise<void> {
  try {
    await apiClient.delete(`/clients/${clientId}`)
  } catch (error) {
    throw toApiError(error)
  }
}
