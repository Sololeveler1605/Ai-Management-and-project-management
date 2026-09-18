import { useState } from 'react'
import type { DocumentOut } from '../../types/api'
import {
  deleteDocument,
  downloadDocument,
  previewDocument,
  reindexDocument,
} from '../../api/documents'
import { docIcon, ragStatusLabel } from '../../lib/helpers'
import { ApiErrorBanner } from './ApiErrorBanner'

type DocumentRowProps = {
  doc: DocumentOut
  canDelete?: boolean
  onChanged?: () => void
  onError?: (err: unknown) => void
}

export function DocumentRow({
  doc,
  canDelete = true,
  onChanged,
  onError,
}: DocumentRowProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function run(action: string, fn: () => Promise<void>) {
    setBusy(action)
    setError(null)
    setNotice(null)
    try {
      await fn()
      onChanged?.()
    } catch (err) {
      setError(err)
      onError?.(err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: canDelete ? '3fr 1fr 1fr 1fr 1fr' : '3fr 1fr 1fr 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #EEF0F3',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              background: '#F3F4F6',
              flexShrink: 0,
            }}
          >
            {docIcon(doc.filename)}
          </span>
          <span style={{ color: '#111827', fontWeight: 500 }}>{doc.filename}</span>
        </div>
        <div style={{ color: '#6B7280', fontSize: '0.82rem', marginTop: 2 }}>
          {ragStatusLabel(doc)}
        </div>
        {notice && (
          <div style={{ color: '#15803D', fontSize: '0.78rem', marginTop: 4 }}>{notice}</div>
        )}
        {error != null && <ApiErrorBanner error={error} />}
      </div>

      <button
        type="button"
        className="btn-secondary"
        disabled={busy !== null}
        onClick={() =>
          run('download', async () => {
            await downloadDocument(String(doc.id), doc.filename)
          })
        }
      >
        {busy === 'download' ? '…' : 'Download'}
      </button>

      <button
        type="button"
        className="btn-secondary"
        disabled={busy !== null}
        onClick={() =>
          run('preview', async () => {
            await previewDocument(String(doc.id), doc.filename)
          })
        }
      >
        {busy === 'preview' ? '…' : 'Preview'}
      </button>

      <button
        type="button"
        className="btn-secondary"
        disabled={busy !== null}
        onClick={() =>
          run('reindex', async () => {
            const data = await reindexDocument(String(doc.id))
            const n = data.chunks_indexed ?? 0
            if (n > 0) {
              setNotice(`Indexed ${n} chunk(s) — available in AI Chat.`)
            } else {
              setNotice(
                'No text extracted. Use PDF, DOCX, PPTX, TXT, CSV, or MD, or check that the file is not image-only.',
              )
            }
          })
        }
      >
        {busy === 'reindex' ? '…' : 'Reindex'}
      </button>

      {canDelete && (
        <button
          type="button"
          className="btn-secondary"
          disabled={busy !== null}
          onClick={() =>
            run('delete', async () => {
              await deleteDocument(String(doc.id))
              setNotice('Document deleted.')
            })
          }
        >
          {busy === 'delete' ? '…' : 'Delete'}
        </button>
      )}
    </div>
  )
}
