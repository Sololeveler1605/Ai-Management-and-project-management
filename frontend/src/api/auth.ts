import type { Token, UserOut, UserRegister } from '../types/api'
import apiClient, { toApiError } from './client'

export async function login(email: string, password: string): Promise<Token> {
  try {
    const body = new URLSearchParams({ username: email, password })
    const { data } = await apiClient.post<Token>('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function register(payload: UserRegister): Promise<UserOut> {
  try {
    const { data } = await apiClient.post<UserOut>('/auth/register', payload)
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
