import apiClient from './client'

export interface HealthResult {
  ok: boolean
  detail: string
  ragWarning?: string
}

/** Quick backend reachability check (GET /, 5s timeout). */
export async function checkHealth(): Promise<HealthResult> {
  const baseURL = apiClient.defaults.baseURL || 'http://localhost:8000'
  try {
    const { data, status } = await apiClient.get<{
      rag_ready?: boolean
      rag_detail?: string
      [key: string]: unknown
    }>('/', { timeout: 5_000 })

    if (status === 200) {
      if (data?.rag_ready === false) {
        const ragWarning = data.rag_detail || 'not ready'
        return {
          ok: true,
          detail: `${baseURL} (RAG warning: ${ragWarning})`,
          ragWarning,
        }
      }
      return { ok: true, detail: baseURL }
    }
    return { ok: false, detail: `${baseURL} returned HTTP ${status}` }
  } catch (error) {
    const name =
      error instanceof Error ? error.constructor.name : 'Error'
    return { ok: false, detail: `${baseURL} is unreachable (${name})` }
  }
}
