/** API types ported from backend/schemas.py (UUIDs/dates as strings over HTTP). */

export type UserRole = 'admin' | 'manager' | 'employee' | 'client' | string

export type TaskStatus = 'todo' | 'in_progress' | 'testing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed'
export type ModuleStatus = 'locked' | 'in_progress' | 'completed'
export type TestingStatus = 'assigned' | 'accepted' | 'submitted'

// ---------- Auth ----------
export interface UserOut {
  id: string
  name: string
  email: string
  role: UserRole
  organization_id: string
  designation?: string | null
  is_active?: boolean
}

export interface UserRegister {
  name: string
  email: string
  password: string
  role: string
  organization_id: string
  designation?: string | null
}

export interface UserUpdate {
  name?: string | null
  email?: string | null
  password?: string | null
  designation?: string | null
  is_active?: boolean | null
}

export interface Token {
  access_token: string
  token_type?: string
  user: UserOut
}

// ---------- Chat ----------
export interface ChatQuery {
  message: string
  document_ids?: string[] | null
  project_id?: string | null
}

export interface ChatResponse {
  answer: string
}

// ---------- Clients ----------
export interface ClientCreate {
  company_name: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
  password?: string | null
}

export interface ClientUpdate {
  company_name?: string | null
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  status?: string | null
}

export interface ClientOut {
  id: string
  company_name: string
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  status: string
  created_at: string
}

// ---------- Tasks ----------
export interface TaskCreate {
  project_id?: string | null
  module_id?: string | null
  title: string
  description?: string | null
  epic?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  story_points?: number | null
  labels?: string[]
  start_date?: string | null
  deadline?: string | null
  assigned_to?: string | null
  testing_assigned_to?: string[]
  testing_status?: TestingStatus | null
  progress_percent?: number | null
}

export interface TaskUpdate {
  project_id?: string | null
  module_id?: string | null
  title?: string | null
  description?: string | null
  epic?: string | null
  status?: TaskStatus | null
  priority?: TaskPriority | null
  story_points?: number | null
  labels?: string[] | null
  start_date?: string | null
  deadline?: string | null
  assigned_to?: string | null
  testing_assigned_to?: string[] | null
  testing_status?: TestingStatus | null
  progress_percent?: number | null
}

export interface TaskStatusUpdate {
  status?: TaskStatus | null
  testing_status?: TestingStatus | null
  progress_percent?: number | null
}

export interface TaskOut {
  id: string
  organization_id: string
  project_id?: string | null
  module_id?: string | null
  title: string
  description?: string | null
  epic?: string | null
  status: string
  completed_at?: string | null
  priority: string
  story_points?: number | null
  labels?: string[]
  start_date?: string | null
  deadline?: string | null
  assigned_to?: string | null
  testing_assigned_to?: string[]
  testing_status?: string | null
  progress_percent?: number
  created_by: string
  created_at: string
}

// ---------- Documents ----------
export interface DocumentOut {
  id: string
  organization_id: string
  project_id?: string | null
  filename: string
  uploaded_by: string
  uploaded_at: string
  chunk_count?: number
}

export interface ReindexResult {
  document_id: string
  filename: string
  chunks_indexed: number
  status: string
}

// ---------- Projects ----------
export interface ProjectCreate {
  client_id: string
  name: string
  description?: string | null
  budget?: number | null
  deadline?: string | null
  status?: ProjectStatus
  team_user_ids?: string[]
}

export interface ProjectUpdate {
  name?: string | null
  description?: string | null
  budget?: number | null
  deadline?: string | null
  status?: ProjectStatus | null
}

export interface ProjectTeamUpdate {
  user_ids: string[]
}

export interface ProjectOut {
  id: string
  organization_id: string
  client_id: string
  name: string
  description?: string | null
  budget?: number | null
  deadline?: string | null
  status: string
  created_by: string
  created_at: string
}

export interface ProjectModuleCreate {
  name: string
  icon?: string | null
  description?: string | null
  status?: ModuleStatus
}

export interface ProjectModuleUpdate {
  name?: string | null
  icon?: string | null
  description?: string | null
  status?: ModuleStatus | null
}

export interface ProjectModuleReorder {
  ordered_ids: string[]
}

export interface ProjectModuleOut {
  id: string
  organization_id: string
  project_id: string
  name: string
  icon: string
  description?: string | null
  status: string
  order: number
  created_by: string
  created_at: string
}

// ---------- Requirement Analyzer ----------
export interface StoryOut {
  title: string
  description: string
  priority?: 'low' | 'medium' | 'high'
}

export interface EpicOut {
  title: string
  stories?: StoryOut[]
}

export interface RequirementAnalysisOut {
  epics?: EpicOut[]
}

export interface RequirementAnalyzeRequest {
  document_id: string
  project_id: string
}

export interface RequirementAnalysisResult {
  id: string
  project_id: string
  document_id?: string | null
  status: string
  breakdown: RequirementAnalysisOut
  created_at: string
}

export interface RequirementReviewApproveRequest {
  epics?: EpicOut[]
}

export interface RequirementApproveResponse {
  analysis_id: string
  task_ids: string[]
}

// ---------- Client Dashboard ----------
export interface ClientDashboardOut {
  project_id: string
  project_name: string
  status: string
  deadline?: string | null
  progress_percent: number
  milestone_info: string
  documents: DocumentOut[]
  /** Attached client-side from modules API */
  module_progress_percent?: number | null
}

/** Alias used by shared chart helpers */
export type ClientDashboardItem = ClientDashboardOut & {
  [key: string]: unknown
}

// ---------- Weekly Reports ----------
export interface WeeklyReportOut {
  id: string
  organization_id: string
  project_id: string
  report_text: string
  created_at: string
}

// ---------- Meetings ----------
export interface MeetingUploadResponse {
  id: string
  status: string
}

export interface MeetingSummaryOut {
  id: string
  project_id: string
  status: string
  transcript?: string | null
  summary?: string | null
  action_items?: string[] | null
  risks?: string[] | null
  deadlines?: string[] | null
  created_at: string
}

export interface MeetingOut {
  id: string
  organization_id: string
  project_id: string
  uploaded_by: string
  audio_file_url: string
  transcript?: string | null
  summary?: string | null
  action_items?: string[]
  risks?: string[]
  deadlines?: string[]
  status: string
  created_at: string
}

// ---------- AI ----------
export interface AITaskGenerateRequest {
  project_name: string
  description: string
}

export interface AITaskOut {
  title: string
  description: string
  priority: string
}

export type ApiErrorLike = {
  status?: number
  detail?: unknown
  message?: string
  text?: string
}
