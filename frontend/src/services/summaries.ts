import { api } from '../lib/api'
import type { Database } from '../types/database'

type AISummary = Database['public']['Tables']['ai_summaries']['Row']

export interface ActionItem {
  text: string
  assigned_to?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface SaveSummaryParams {
  meeting_id: string
  summary?: string
  action_items?: ActionItem[]
  decisions?: string[]
  key_points?: string[]
  keywords?: string[]
}

export async function saveSummary(params: SaveSummaryParams) {
  const { data, error } = await api.summaries.create({
    meetingId: params.meeting_id,
    summary: params.summary,
    actionItems: params.action_items,
    decisions: params.decisions,
    keyPoints: params.key_points,
    keywords: params.keywords,
  })

  if (error) {
    throw new Error(error)
  }

  const summary = data ? mapSummaryResponse(data) : null

  return { data: summary, error: null }
}

export async function getSummaryByMeeting(meetingId: string) {
  const { data, error } = await api.summaries.getByMeeting(meetingId)

  if (error) {
    throw new Error(error)
  }

  const summary = data ? mapSummaryResponse(data) : null

  return { data: summary, error: null }
}

export async function getSummary(summaryId: string) {
  const { data, error } = await api.summaries.get(summaryId)

  if (error) {
    throw new Error(error)
  }

  const summary = data ? mapSummaryResponse(data) : null

  return { data: summary, error: null }
}

export async function updateSummary(
  summaryId: string,
  updates: {
    summary?: string
    action_items?: ActionItem[]
    decisions?: string[]
    key_points?: string[]
    keywords?: string[]
  }
) {
  const { data, error } = await api.summaries.update(summaryId, {
    summary: updates.summary,
    actionItems: updates.action_items,
    decisions: updates.decisions,
    keyPoints: updates.key_points,
    keywords: updates.keywords,
  })

  if (error) {
    throw new Error(error)
  }

  const summary = data ? mapSummaryResponse(data) : null

  return { data: summary, error: null }
}

export async function deleteSummary(summaryId: string) {
  const { error } = await api.summaries.delete(summaryId)

  if (error) {
    throw new Error(error)
  }

  return { error: null }
}

export interface SummarizeMeetingParams {
  meeting_id: string
}

export interface SummarizeResult {
  success: boolean
  meeting_id: string
  ai_summary_id: string
  data: {
    summary: string
    action_items: Array<{
      title: string
      owner: string | null
      deadline: string | null
    }>
    tasks: Array<{
      title: string
      status: 'todo' | 'doing' | 'done'
    }>
    decisions: string[]
    key_points: string[]
    keywords: string[]
  }
}

export async function summarizeMeeting({
  meeting_id,
}: SummarizeMeetingParams): Promise<{ data: SummarizeResult | null; error: Error | null }> {
  const { data, error } = await api.summarize({
    meetingId: meeting_id,
  })

  if (error) {
    return { data: null, error: new Error(error) }
  }

  const result: SummarizeResult = {
    success: true,
    meeting_id: data?.meetingId || meeting_id,
    ai_summary_id: data?.summaryId || '',
    data: {
      summary: data?.summary || '',
      action_items: data?.actionItems || [],
      tasks: data?.tasks || [],
      decisions: data?.decisions || [],
      key_points: data?.keyPoints || [],
      keywords: data?.keywords || [],
    },
  }

  return { data: result, error: null }
}

function mapSummaryResponse(data: any): AISummary {
  return {
    id: data.id,
    meeting_id: data.meetingId,
    summary: data.summary,
    action_items: data.actionItems || [],
    decisions: data.decisions || [],
    key_points: data.keyPoints || [],
    keywords: data.keywords || [],
    created_at: data.createdAt,
    updated_at: data.updatedAt,
  }
}
