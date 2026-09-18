import apiClient, { toApiError } from './client'
import type { WeeklyReportOut } from '../types/api'

export async function generateWeeklyReport(
  projectId: string,
): Promise<WeeklyReportOut> {
  try {
    const { data } = await apiClient.post<WeeklyReportOut>(
      `/weekly-reports/${projectId}`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listWeeklyReports(
  projectId: string,
): Promise<WeeklyReportOut[]> {
  try {
    const { data } = await apiClient.get<WeeklyReportOut[]>(
      `/weekly-reports/${projectId}`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
