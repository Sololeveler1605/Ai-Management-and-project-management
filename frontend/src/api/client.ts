import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const TOKEN_KEY = 'ai_project_os_token'

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

export const API_BASE_URL = baseURL

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
})

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = readToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export class ApiError extends Error {
  status?: number
  detail?: unknown

  constructor(message: string, status?: number, detail?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

/** Extract FastAPI-style `detail` from an axios error (string or JSON-serializable). */
export function getApiErrorDetail(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | string | undefined
    if (typeof data === 'string' && data.trim()) return data
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = data.detail
      if (typeof detail === 'string') return detail
      if (detail != null) {
        try {
          return JSON.stringify(detail)
        } catch {
          return String(detail)
        }
      }
    }
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Request failed'
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  const detail = getApiErrorDetail(error)
  const status = axios.isAxiosError(error) ? error.response?.status : undefined
  return new ApiError(
    detail,
    status,
    axios.isAxiosError(error) ? error.response?.data : undefined,
  )
}

export { AxiosError }
export default apiClient
