import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../api/client'
import { BarChart, DonutChart, ProgressRing } from '../../../components/Charts'
import { Empty, ErrorState, Loading } from '../../../components/State'


export const taskStatusColors = { todo:'#94a3b8', in_progress:'#318ce7', testing:'#bc70dc', done:'#1db379' }
export const statusCounts = tasks => Object.keys(taskStatusColors).map(key => ({ label:key.replace('_', ' '), value:tasks.filter(task => task.status === key).length, color:taskStatusColors[key] }))
export const daysLeft = date => { if (!date) return null; const target = new Date(`${String(date).slice(0, 10)}T00:00:00`); return Number.isNaN(target) ? null : Math.ceil((target - Date.now()) / 86400000) }

export function useLoad(work, deps = []) {
  const [state, setState] = useState({ loading:true, error:null, data:null })
  const reload = () => { setState({ loading:true, error:null, data:null }); work().then(data => setState({ loading:false, error:null, data })).catch(error => setState({ loading:false, error, data:null })) }
  useEffect(reload, deps)
  return { ...state, reload }
}

export function Heading({ eyebrow, title, description, children }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p className="muted">{description}</p></div>{children}</div> }
export function Stat({ icon, label, value, note, tone = "", onClick }) { return <div className={`stat-card ${onClick ? "actionable" : ""}`} onClick={onClick}><span className={`stat-icon ${tone}`}>{icon || "✦"}</span><div><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></div></div> }

function ClientDashboard() { const navigate = useNavigate();
  const { loading, error, data, reload } = useLoad(() => api.clientDashboard())
  const [selected, setSelected] = useState('all')
  const [modules, setModules] = useState({})
  const all = data || []
  const rows = selected === 'all' ? all : all.filter(row => String(row.project_id) === String(selected))

  useEffect(() => {
    Promise.all(rows.map(row => api.modules(row.project_id).then(value => [row.project_id, value]).catch(() => [row.project_id, []]))).then(entries => setModules(Object.fromEntries(entries)))
  }, [data, selected])

  if (loading) return <Loading label="Loading client projects…" />
  if (error) return <ErrorState error={error} onRetry={reload} />
  const documents = rows.flatMap(row => row.documents || [])
  const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + Number(row.module_progress_percent ?? row.progress_percent ?? 0), 0) / rows.length) : 0
  const ordered = [...rows].sort((a, b) => (daysLeft(a.deadline) ?? 99999) - (daysLeft(b.deadline) ?? 99999))
  const lead = ordered[0]

  return <div className="page client-page"><Heading eyebrow="CLIENT WORKSPACE" title="✦ My Projects" description="Your delivery progress, deadlines, documents, and project modules."><select className="filter" value={selected} onChange={event => setSelected(event.target.value)}><option value="all">All projects</option>{all.map(row => <option value={row.project_id} key={row.project_id}>{row.project_name}</option>)}</select></Heading><div className="stats-grid"><Stat onClick={() => {}} icon="✦" label="Total Projects" value={rows.length} note="All ongoing projects" /><Stat onClick={() => {}} icon="✦" label="Average Progress" value={`${average}%`} note="Across selected projects" tone="green" /><Stat onClick={() => navigate('/client/documents')} icon="✦" label="Documents" value={documents.length} note="Total documents" tone="blue" /><Stat onClick={() => {}} icon="✦" label="Nearest Deadline" value={lead && daysLeft(lead.deadline) !== null ? `${daysLeft(lead.deadline)}d` : ''} note="Upcoming" tone="amber" /></div>{lead ? <><section className="panel client-hero"><div className="client-project-card"><div className="client-large-ring"><ProgressRing onClick={() => {}} value={Number(lead.module_progress_percent ?? lead.progress_percent ?? 0)} /></div><div><span className={`badge ${lead.status}`}>{lead.status?.replace('_', ' ')}</span><h3>{lead.project_name}</h3><p className="muted">✦ Deadline <b>{lead.deadline || ''}</b>{daysLeft(lead.deadline) !== null && `  ${daysLeft(lead.deadline)} day(s) remaining`}</p><div className="progress"><span style={{ width:`${Number(lead.module_progress_percent ?? lead.progress_percent ?? 0)}%` }} /></div></div></div><details><summary>✦ Project modules ({(modules[lead.project_id] || []).length})</summary>{(modules[lead.project_id] || []).map(module => <div className="module-row" key={module.id}><span>{module.icon || '✦'}</span><div><strong>{module.name}</strong><small>{module.description || 'No description'}</small></div><span className={`badge ${module.status}`}>{module.status?.replace('_', ' ')}</span></div>)}</details></section>{selected === 'all' && ordered.slice(1).length > 0 && <section className="panel"><div className="panel-heading"><h3>✦ My Projects</h3></div><div className="client-project-grid">{ordered.slice(1).map(row => <article className="client-project-card" key={row.project_id}><div className="client-large-ring"><ProgressRing onClick={() => {}} value={Number(row.module_progress_percent ?? row.progress_percent ?? 0)} /></div><div><h3>{row.project_name}</h3><span className={`badge ${row.status}`}>{row.status?.replace('_', ' ')}</span><small>Deadline: {row.deadline || ''}  {daysLeft(row.deadline) ?? ''}d remaining</small></div></article>)}</div></section>}<section className="panel"><div className="panel-heading"><h3>✦ Project Overview</h3><span className="muted">Preview and manage files shared with your projects.</span></div>{documents.map(doc => <div className="mini-row" key={doc.id}><span>✦</span><strong>{doc.filename}</strong><button className="text-button" onClick={() => api.previewDocument(doc.id, doc.filename)}>Preview</button><button className="text-button danger" onClick={() => { if(window.confirm(`Delete ${doc.filename}?`)) api.deleteDocument(doc.id).then(reload) }}>Delete</button></div>)}{!documents.length && <Empty>No project documents yet.</Empty>}</section></> : <Empty>No projects found for your account.</Empty>}</div>
}

function ClientDocuments(){const [dashboards,setDashboards]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[uploadProject,setUploadProject]=useState(''),[file,setFile]=useState(null),[busy,setBusy]=useState(false);const load=()=>{setLoading(true);api.clientDashboard().then(data=>{setDashboards(data||[]);setUploadProject(current=>current||String(data?.[0]?.project_id||''))}).catch(setError).finally(()=>setLoading(false))};useEffect(load,[]);async function upload(e){e.preventDefault();if(!file||!uploadProject)return;setBusy(true);try{await api.uploadDocument(file,uploadProject);setFile(null);e.target.reset();load()}catch(err){setError(err)}finally{setBusy(false)}}async function remove(doc){if(!window.confirm(`Delete ${doc.filename}?`))return;try{await api.deleteDocument(doc.id);load()}catch(err){setError(err)}}if(loading)return <Loading label="Loading your project documents"/>;if(error)return <ErrorState error={error} onRetry={load}/>;return <div className="page client-page"><div className="page-heading"><div><span className="eyebrow">CLIENT WORKSPACE</span><h2>✦ Documents</h2><p className="muted">Upload to a project, or preview files shared by your team.</p></div></div><section className="panel"><h3>✦ Upload a document</h3>{dashboards.length?<form className="upload-form" onSubmit={upload}><label>Project<select value={uploadProject} onChange={e=>setUploadProject(e.target.value)}>{dashboards.map(row=><option key={row.project_id} value={row.project_id}>{row.project_name}</option>)}</select></label><label>Choose a file<input type="file" required onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button className="button primary" disabled={busy}>{busy?'Uploading':'Upload'}</button></form>:<Empty>No projects available to upload into yet.</Empty>}</section>{dashboards.some(row=>(row.documents||[]).length)?<section className="panel client-document-tabs"><h3>Project files</h3>{dashboards.filter(row=>(row.documents||[]).length).map((row,index)=><details key={row.project_id} open={index===0}><summary>✦ {row.project_name} <span>{row.documents.length} file(s)</span></summary>{row.documents.map(doc=><div className="mini-row document-action-row" key={doc.id}><span>✦</span><div><strong>{doc.filename}</strong><small>{doc.chunk_count?`${doc.chunk_count} chunks indexed`:'Not indexed'}</small></div><button className="text-button" onClick={()=>api.downloadDocument(doc.id,doc.filename)}>Download</button><button className="text-button" onClick={()=>api.previewDocument(doc.id,doc.filename)}>Preview</button><button className="text-button danger" onClick={()=>remove(doc)}>Delete</button></div>)}</details>)}</section>:<Empty>No documents on your projects yet. Upload one above, or wait for your team to share files.</Empty>}</div>}

export const clientPages={dashboard:ClientDashboard,documents:ClientDocuments}

