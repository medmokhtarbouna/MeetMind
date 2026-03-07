import { api } from '../lib/api'
import type { Database } from '../types/database'

type Transcription = Database['public']['Tables']['transcriptions']['Row']

export interface SaveTranscriptionParams {
  recording_id: string
  text: string
  language?: string
}

export async function saveTranscription(params: SaveTranscriptionParams) {
  const { data, error } = await api.transcriptions.create({
    recordingId: params.recording_id,
    text: params.text,
    language: params.language,
  })

  if (error) {
    throw new Error(error)
  }

  const transcription = data ? mapTranscriptionResponse(data) : null

  return { data: transcription, error: null }
}

export async function getTranscriptionByRecording(recordingId: string) {
  const { data, error } = await api.transcriptions.getByRecording(recordingId)

  if (error) {
    throw new Error(error)
  }

  const transcription = data ? mapTranscriptionResponse(data) : null

  return { data: transcription, error: null }
}

export async function getTranscription(transcriptionId: string) {
  const { data, error } = await api.transcriptions.get(transcriptionId)

  if (error) {
    throw new Error(error)
  }

  const transcription = data ? mapTranscriptionResponse(data) : null

  return { data: transcription, error: null }
}

export async function updateTranscription(
  transcriptionId: string,
  updates: { text?: string; language?: string }
) {
  const { data, error } = await api.transcriptions.update(transcriptionId, updates)

  if (error) {
    throw new Error(error)
  }

  const transcription = data ? mapTranscriptionResponse(data) : null

  return { data: transcription, error: null }
}

export async function deleteTranscription(transcriptionId: string) {
  const { error } = await api.transcriptions.delete(transcriptionId)

  if (error) {
    throw new Error(error)
  }

  return { error: null }
}

function mapTranscriptionResponse(data: any): Transcription {
  return {
    id: data.id,
    recording_id: data.recordingId,
    text: data.text,
    language: data.language,
    created_at: data.createdAt,
  }
}
