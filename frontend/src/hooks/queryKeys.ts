export const queryKeys = {
  clients: ['clients'] as const,
  projects: ['projects'] as const,
  tasks: (projectId?: string | null) =>
    projectId ? (['tasks', projectId] as const) : (['tasks'] as const),
  documents: (projectId?: string | null) =>
    projectId ? (['documents', projectId] as const) : (['documents'] as const),
  users: ['users'] as const,
  team: (projectId: string) => ['team', projectId] as const,
  modules: (projectId: string) => ['modules', projectId] as const,
  weeklyReports: (projectId: string) => ['weekly-reports', projectId] as const,
  meetings: (projectId: string) => ['meetings', projectId] as const,
  requirementAnalysis: (id: string) => ['requirement-analysis', id] as const,
}
