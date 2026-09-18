import apiClient, { toApiError } from './client'
import type {
  EpicOut,
  RequirementAnalysisResult,
  RequirementApproveResponse,
} from '../types/api'

export async function analyze(
  documentId: string,
  projectId: string,
): Promise<RequirementAnalysisResult> {
  try {
    const { data } = await apiClient.post<RequirementAnalysisResult>(
      '/ai/analyze-requirement',
      { document_id: documentId, project_id: projectId },
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function get(
  analysisId: string,
): Promise<RequirementAnalysisResult> {
  try {
    const { data } = await apiClient.get<RequirementAnalysisResult>(
      `/ai/requirement-analyses/${analysisId}`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function approve(
  analysisId: string,
  epics: EpicOut[],
): Promise<RequirementApproveResponse> {
  try {
    const { data } = await apiClient.post<RequirementApproveResponse>(
      `/ai/requirement-analyses/${analysisId}/approve`,
      { epics },
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function reject(
  analysisId: string,
): Promise<{ analysis_id: string; status: string }> {
  try {
    const { data } = await apiClient.post<{ analysis_id: string; status: string }>(
      `/ai/requirement-analyses/${analysisId}/reject`,
    )
    return data
  } catch (error) {
    throw toApiError(error)
  }
}
