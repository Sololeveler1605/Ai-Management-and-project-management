import type { ClientDashboardItem, DocumentOut, TaskOut, UserOut } from '../types/api'

/** Admin task statuses — streamlit_app/views/admin.py STATUS_META */
export const STATUS_META: Record<string, { label: string; icon: string; color: string }> = {
  todo: { label: 'To Do', icon: '🔵', color: '#3B82F6' },
  in_progress: { label: 'In Progress', icon: '🟠', color: '#F59E0B' },
  testing: { label: 'Testing', icon: '🟣', color: '#8B5CF6' },
  done: { label: 'Done', icon: '🟢', color: '#22C55E' },
}

/** Admin project statuses — order drives legend/pie */
export const PROJECT_STATUS_META: Record<string, { label: string; color: string }> = {
  completed: { label: 'Completed', color: '#22C55E' },
  active: { label: 'In Progress', color: '#3B82F6' },
  on_hold: { label: 'On Hold', color: '#F59E0B' },
  planning: { label: 'Not Started', color: '#EF4444' },
}

export const PROJECT_STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed'] as const

/** Admin client company statuses */
export const CLIENT_STATUS_META: Record<string, { icon: string; color: string }> = {
  active: { icon: '🟢', color: '#22C55E' },
  pending: { icon: '🟡', color: '#EAB308' },
  inactive: { icon: '⚪', color: '#6B7280' },
}

export const CLIENT_STATUS_OPTIONS = ['active', 'pending', 'inactive'] as const

/** Client dashboard project STATUS_META — streamlit_app/views/client.py */
export const CLIENT_DASH_STATUS_META: Record<
  string,
  { icon: string; color: string; hex: string }
> = {
  'in progress': { icon: '🔵', color: 'blue', hex: '#3B82F6' },
  in_progress: { icon: '🔵', color: 'blue', hex: '#3B82F6' },
  planning: { icon: '🟣', color: 'violet', hex: '#8B5CF6' },
  active: { icon: '🟢', color: 'green', hex: '#22C55E' },
  on_hold: { icon: '🟠', color: 'orange', hex: '#F59E0B' },
  completed: { icon: '🟢', color: 'green', hex: '#22C55E' },
}

export const DOC_ICON: Record<string, string> = {
  pdf: '📕',
  doc: '📘',
  docx: '📘',
  xls: '📗',
  xlsx: '📗',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  zip: '🗜️',
}

export const DOC_TYPE_PILL: Record<string, [string, string]> = {
  pdf: ['PDF', 'pill-red'],
  doc: ['DOC', 'pill-blue'],
  docx: ['DOCX', 'pill-blue'],
  xls: ['XLS', 'pill-green'],
  xlsx: ['XLSX', 'pill-green'],
  png: ['IMG', 'pill-gray'],
  jpg: ['IMG', 'pill-gray'],
  jpeg: ['IMG', 'pill-gray'],
  zip: ['ZIP', 'pill-gray'],
}

export const CHART_COLORS = {
  indigo: '#6366F1',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  pink: '#EC4899',
  teal: '#14B8A6',
  violet: '#8B5CF6',
  blue: '#2563EB',
  grid: '#E5E7EB',
  text: '#111827',
} as const

const RAG_SUPPORTED_EXTS = ['.pdf', '.docx', '.pptx', '.txt', '.csv', '.md', '.log'] as const

export function initials(text: string, maxLetters = 2): string {
  const parts = text.replace(/_/g, ' ').split(/\s+/).filter(Boolean)
  return parts
    .slice(0, maxLetters)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?'
}

function tryParseDate(raw: string, fmt: string): Date | null {
  const s = raw.trim()
  if (fmt === '%Y-%m-%d') {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
    if (!m) return null
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  if (fmt === '%m/%d/%Y') {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s)
    if (!m) return null
    return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]))
  }
  if (fmt === '%d %b %Y') {
    const m = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(s)
    if (!m) return null
    const months = 'JanFebMarAprMayJunJulAugSepOctNovDec'
    const mi = months.indexOf(m[2].slice(0, 1).toUpperCase() + m[2].slice(1, 3).toLowerCase())
    if (mi < 0) return null
    return new Date(Number(m[3]), mi / 3, Number(m[1]))
  }
  if (fmt === '%B %d, %Y') {
    const m = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/.exec(s)
    if (!m) return null
    const d = new Date(`${m[1]} ${m[2]}, ${m[3]}`)
    return Number.isNaN(d.getTime()) ? null : d
  }
  return null
}

/** Multi-format deadline parse — admin.py / client.py `_days_left` */
export function daysLeft(deadlineStr: string | null | undefined): number | null {
  if (!deadlineStr) return null
  const raw = String(deadlineStr)
  for (const fmt of ['%Y-%m-%d', '%d %b %Y', '%B %d, %Y', '%m/%d/%Y'] as const) {
    const d = tryParseDate(raw, fmt)
    if (!d || Number.isNaN(d.getTime())) continue
    const today = new Date()
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    const utcDead = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
    return Math.round((utcDead - utcToday) / 86400000)
  }
  return null
}

export function ragStatusLabel(doc: Pick<DocumentOut, 'filename' | 'chunk_count'>): string {
  const chunks = Number(doc.chunk_count || 0)
  if (chunks > 0) return `RAG ready · ${chunks} chunk(s)`
  const name = (doc.filename || '').toLowerCase()
  if (RAG_SUPPORTED_EXTS.some((ext) => name.endsWith(ext))) {
    return 'Not indexed for chat — click Reindex'
  }
  return 'Unsupported for RAG (use PDF/DOCX/PPTX/TXT/CSV/MD)'
}

export function userOptionLabel(u: Pick<UserOut, 'name' | 'email' | 'role'>): string {
  const role = (u.role || '').trim()
  const roleTag = role ? ` · ${role}` : ''
  return `${u.name || '—'} (${u.email || '—'})${roleTag}`
}

export function splitStaff(users: UserOut[]): { managers: UserOut[]; employees: UserOut[] } {
  const managers = users.filter((u) => (u.role || '').toLowerCase() === 'manager')
  const employees = users.filter((u) => (u.role || '').toLowerCase() === 'employee')
  return { managers, employees }
}

export function projectTaskProgress(
  projectId: string,
  tasks: TaskOut[],
): [number | null, number, number] {
  const linked = tasks.filter((t) => String(t.project_id) === String(projectId))
  if (!linked.length) return [null, 0, 0]
  const done = linked.filter((t) => (t.status || '') === 'done').length
  return [Math.round((100 * done) / linked.length), done, linked.length]
}

export function clientStatusMeta(statusText: string | null | undefined): { icon: string; color: string } {
  return (
    CLIENT_STATUS_META[(statusText || '').trim().toLowerCase()] || {
      icon: '⚪',
      color: '#6B7280',
    }
  )
}

/** Client dashboard project status meta — client.py `_status_meta` */
export function statusMeta(statusText: string | null | undefined): {
  icon: string
  color: string
  hex: string
} {
  return (
    CLIENT_DASH_STATUS_META[(statusText || '').trim().toLowerCase()] || {
      icon: '⚪',
      color: 'gray',
      hex: '#6B7280',
    }
  )
}

export function effectiveProgress(
  dashboard: Pick<ClientDashboardItem, 'module_progress_percent' | 'status' | 'progress_percent'>,
): number {
  if (dashboard.module_progress_percent != null) return Number(dashboard.module_progress_percent)
  if ((dashboard.status || '').trim().toLowerCase() === 'completed') return 100
  return Number(dashboard.progress_percent ?? 0)
}

export function isCompleted(
  dashboard: Pick<ClientDashboardItem, 'status'>,
): boolean {
  return (dashboard.status || '').trim().toLowerCase() === 'completed'
}

export function deadlinePill(days: number | null): [string, string] {
  if (days === null) return ['No deadline', 'pill-gray']
  if (days < 0) return ['Overdue', 'pill-red']
  if (days <= 3) return ['Soon', 'pill-orange']
  return ['On track', 'pill-green']
}

export function docExt(filename: string): string {
  return filename.includes('.') ? filename.split('.').pop()!.toLowerCase() : ''
}

export function docIcon(filename: string): string {
  return DOC_ICON[docExt(filename)] || '📄'
}

export function docTypePill(filename: string): [string, string] {
  const ext = docExt(filename)
  return DOC_TYPE_PILL[ext] || [ext.toUpperCase() || 'FILE', 'pill-gray']
}
