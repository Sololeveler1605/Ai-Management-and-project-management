import { ApiError } from '../../api/client'
import type { ApiErrorLike } from '../../types/api'

type ApiErrorBannerProps = {
  error: unknown
  className?: string
}

function formatDetail(detail: unknown): string {
  if (detail == null) return ''
  if (typeof detail === 'string') return detail
  try {
    return JSON.stringify(detail)
  } catch {
    return String(detail)
  }
}

/** Mirrors shared.py `show_api_error` — Forbidden / Not found / Request failed */
export function ApiErrorBanner({ error, className = '' }: ApiErrorBannerProps) {
  if (error == null) return null

  let status = 0
  let detail: unknown = ''

  if (error instanceof ApiError) {
    status = error.status ?? 0
    detail = error.detail
  } else if (typeof error === 'object' && error !== null && 'status' in error) {
    const e = error as ApiErrorLike
    status = Number(e.status) || 0
    detail = e.detail ?? e.message ?? e.text ?? ''
  } else if (error instanceof Error) {
    detail = error.message
  } else {
    detail = String(error)
  }

  const detailText = formatDetail(detail)
  let message: string
  if (status === 403) message = `Forbidden: ${detailText}`
  else if (status === 404) message = `Not found: ${detailText}`
  else if (status) message = `Request failed (${status}): ${detailText}`
  else message = detailText || 'Request failed'

  return (
    <div
      className={className}
      role="alert"
      style={{
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 10,
        color: '#991B1B',
        padding: '10px 14px',
        fontSize: '0.875rem',
        marginTop: 8,
      }}
    >
      {message}
    </div>
  )
}
