import { useEffect, useState } from 'react'
import { api } from '../api/client'

const imageFile = name => /\.(png|jpe?g|gif|webp|svg)$/i.test(name || '')
const textFile = name => /\.(txt|md|csv|json|xml|html?|js|jsx|css)$/i.test(name || '')

export function DocumentPreview({ document, onClose }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (document.url) { setUrl(document.url); return () => URL.revokeObjectURL(document.url) }
    let active = true
    api.previewDocument(document.id)
      .then(result => { if (active) setUrl(result.url) })
      .catch(err => { if (active) setError(err.message || 'Unable to preview this document.') })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [document.id])

  return <div className="modal-backdrop document-preview-backdrop" style={{zIndex:1000}} role="dialog" aria-modal="true" aria-label={`Preview ${document.filename}`}>
    <section className="document-preview-modal" style={{width:'min(1100px, 92vw)',height:'min(82vh, 820px)',display:'flex',flexDirection:'column',background:'#fff',borderRadius:16,padding:22}}>
      <div className="modal-top"><div><span className="eyebrow">DOCUMENT PREVIEW</span><h2>{document.filename}</h2></div><button className="icon-button" onClick={onClose}>Close</button></div>
      <div className="document-preview-body" style={{flex:1,minHeight:0,margin:'16px 0',border:'1px solid #e2e8f0',borderRadius:10,overflow:'hidden'}}>
        {error && <p className="alert error">{error}</p>}
        {!error && !url && <p className="muted">Loading preview…</p>}
        {url && imageFile(document.filename) && <img src={url} alt={document.filename} style={{maxWidth:'100%',maxHeight:'100%',display:'block',margin:'auto'}}/>}
        {url && textFile(document.filename) && <iframe title={document.filename} src={url} style={{width:'100%',height:'100%',border:0}}/>}
        {url && !imageFile(document.filename) && !textFile(document.filename) && <iframe title={document.filename} src={url} style={{width:'100%',height:'100%',border:0}}/>}
      </div>
      <div className="document-preview-actions"><button className="button secondary" onClick={() => api.downloadDocument(document.id, document.filename)}>Download</button><button className="button secondary" onClick={onClose}>Close</button></div>
    </section>
  </div>
}

export function DocumentPreviewButton({ document, className = 'text-button' }) {
  const [open, setOpen] = useState(false)
  return <>{open && <DocumentPreview document={document} onClose={() => setOpen(false)} />}<button className={className} onClick={() => setOpen(true)}>Preview</button></>
}

export function DocumentPreviewHost() {
  const [document, setDocument] = useState(null)
  useEffect(() => {
    const show = event => setDocument(event.detail)
    window.addEventListener('document-preview', show)
    return () => window.removeEventListener('document-preview', show)
  }, [])
  return document && <DocumentPreview document={document} onClose={() => setDocument(null)} />
}
