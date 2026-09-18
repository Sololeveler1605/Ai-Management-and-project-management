import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { askAiChat } from '../../api/chat'
import { listDocuments } from '../../api/documents'
import { ApiError } from '../../api/client'
import type { DocumentOut } from '../../types/api'

type ChatTurn = [role: 'user' | 'assistant', text: string]

/**
 * Mirrors streamlit_app/app.py `_render_shared_chat` exactly:
 * collapsible expander, doc multiselect, last 12 history, send, clear.
 */
export function SidebarChatAssistant() {
  const [open, setOpen] = useState(false)
  const [documents, setDocuments] = useState<DocumentOut[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [history, setHistory] = useState<ChatTurn[]>([])
  const [prompt, setPrompt] = useState('')
  const [sending, setSending] = useState(false)

  const loadDocs = useCallback(async () => {
    try {
      const docs = await listDocuments()
      setDocuments(docs || [])
    } catch {
      setDocuments([])
    }
  }, [])

  useEffect(() => {
    if (open) void loadDocs()
  }, [open, loadDocs])

  const { docLabels, docLabelToId, docIdToChunks, indexedCount } = useMemo(() => {
    const docLabelToId: Record<string, string> = {}
    const docIdToChunks: Record<string, number> = {}
    let indexedCount = 0
    for (const d of documents) {
      if (!d?.id) continue
      const docId = String(d.id)
      const chunks = Number(d.chunk_count || 0)
      docIdToChunks[docId] = chunks
      if (chunks > 0) indexedCount += 1
      const tag = chunks ? `${chunks} chunks` : 'not indexed'
      const label = `${d.filename || 'file'} [${tag}] (${docId.slice(0, 8)})`
      docLabelToId[label] = docId
    }
    return {
      docLabels: Object.keys(docLabelToId),
      docLabelToId,
      docIdToChunks,
      indexedCount,
    }
  }, [documents])

  const selectedLabels = useMemo(
    () => docLabels.filter((lbl) => selectedIds.includes(docLabelToId[lbl])),
    [docLabels, docLabelToId, selectedIds],
  )

  async function onSend(e: FormEvent) {
    e.preventDefault()
    const message = prompt.trim()
    if (!message || sending) return

    const docIdsArg = selectedIds.length ? selectedIds : null
    let displayMsg = message
    if (selectedIds.length) {
      displayMsg = `${message}  \n_(${selectedIds.length} doc selected)_`
    }

    setHistory((h) => [...h, ['user', displayMsg]])
    setPrompt('')
    setSending(true)

    try {
      const response = await askAiChat(message, docIdsArg)
      const answer = response.answer || 'No answer returned.'
      setHistory((h) => [...h, ['assistant', answer]])
    } catch (err) {
      let answer: string
      if (err instanceof ApiError) {
        const detail =
          typeof err.detail === 'string' ? err.detail : err.message || 'Unknown error'
        answer = `Error (${err.status}): ${detail}`
      } else if (err instanceof Error) {
        answer = `Could not reach chat API: ${err.message}`
      } else {
        answer = `Could not reach chat API: ${String(err)}`
      }
      setHistory((h) => [...h, ['assistant', answer]])
    } finally {
      setSending(false)
    }
  }

  function onToggleDoc(label: string) {
    const id = docLabelToId[label]
    if (!id) return
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div className="sidebar-chat">
      <button
        type="button"
        className="sidebar-chat__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>AI Chat Assistant</span>
        <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="sidebar-chat__body">
          <p className="sidebar-chat__caption">
            Try: pending tasks · project status · or ask about selected documents
          </p>

          {docLabels.length > 0 ? (
            <>
              <p className="sidebar-chat__caption">
                Documents linked to chat: {indexedCount}/{docLabels.length} RAG-ready
                (indexed).
              </p>
              <label className="sidebar-chat__label">Search in documents (RAG)</label>
              <div className="sidebar-chat__multiselect">
                {docLabels.map((label) => (
                  <label key={label} className="sidebar-chat__option">
                    <input
                      type="checkbox"
                      checked={selectedLabels.includes(label)}
                      onChange={() => onToggleDoc(label)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {selectedIds.length > 0 ? (
                <>
                  <p className="sidebar-chat__caption">
                    RAG mode: {selectedIds.length} document(s) selected
                  </p>
                  {selectedIds.some((i) => (docIdToChunks[i] || 0) === 0) && (
                    <p className="sidebar-chat__caption">
                      Some selected files are not indexed yet. Open Documents → Reindex, then
                      ask again.
                    </p>
                  )}
                </>
              ) : (
                indexedCount === 0 && (
                  <p className="sidebar-chat__caption">
                    No indexed files yet. Open Documents and click Reindex on
                    PDF/DOCX/PPTX/TXT uploads.
                  </p>
                )
              )}
            </>
          ) : (
            <p className="sidebar-chat__caption">
              No documents available yet. Upload a PDF/DOCX/PPTX/TXT on the Documents page to
              enable RAG.
            </p>
          )}

          <div className="sidebar-chat__history">
            {history.slice(-12).map(([role, text], i) => (
              <div key={i} className="sidebar-chat__turn">
                <strong>{role === 'user' ? 'You' : 'Assistant'}:</strong> {text}
              </div>
            ))}
          </div>

          <form onSubmit={onSend} className="sidebar-chat__form">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about tasks, projects, or selected docs..."
              disabled={sending}
            />
            <button type="submit" className="btn-primary" disabled={sending || !prompt.trim()}>
              Send
            </button>
          </form>

          {history.length > 0 && (
            <button
              type="button"
              className="btn-secondary sidebar-chat__clear"
              onClick={() => setHistory([])}
            >
              Clear chat
            </button>
          )}
        </div>
      )}
    </div>
  )
}
