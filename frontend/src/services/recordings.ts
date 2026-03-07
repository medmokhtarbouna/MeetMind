import { api } from '../lib/api'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'

type Recording = Database['public']['Tables']['recordings']['Row']

export interface CreateRecordingParams {
  meeting_id: string
  file_name: string
  mime_type?: string
  duration_seconds?: number
}

export interface UploadRecordingParams {
  meeting_id: string
  file: File
  onProgress?: (progress: number) => void
}

export async function createRecordingRow(params: CreateRecordingParams) {
  const { data, error } = await api.recordings.create({
    meetingId: params.meeting_id,
    fileName: params.file_name,
    mimeType: params.mime_type,
    durationSeconds: params.duration_seconds,
  })

  if (error) {
    throw new Error(error)
  }

  const recording = data ? {
    id: data.id || data.recordingId,
    meeting_id: data.meetingId,
    uploader_id: data.uploaderId,
    storage_path: data.storagePath,
    file_name: data.fileName,
    mime_type: data.mimeType,
    duration_seconds: data.durationSeconds,
    created_at: data.createdAt,
  } : null

  return { data: recording, error: null, storagePath: data?.storagePath }
}

export async function uploadRecordingFile({
  meeting_id,
  file,
  onProgress,
}: UploadRecordingParams) {
  const { data: recording, error: createError, storagePath } = await createRecordingRow({
    meeting_id,
    file_name: file.name,
    mime_type: file.type,
  })

  if (createError || !storagePath) {
    throw createError || new Error('Failed to create recording row')
  }

  let progressValue = 10
  if (onProgress) {
    onProgress(progressValue)
    
    const progressInterval = setInterval(() => {
      progressValue = Math.min(progressValue + 10, 90)
      onProgress(progressValue)
    }, 200)
    
    setTimeout(() => {
      clearInterval(progressInterval)
      if (onProgress) onProgress(100)
    }, 2000)
  }

  const { error: uploadError } = await supabase.storage
    .from('recordings')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (onProgress) {
    onProgress(100)
  }

  if (uploadError) {
    if (recording && 'id' in recording) {
      await api.recordings.delete((recording as any).id)
    }
    throw uploadError
  }

  return { data: recording, error: null }
}

export async function listRecordingsByMeeting(meetingId: string) {
  const { data, error } = await api.recordings.listByMeeting(meetingId)

  if (error) {
    throw new Error(error)
  }

  const recordings = (data || []).map((r: any) => ({
    id: r.id || r.recordingId,
    meeting_id: r.meetingId,
    uploader_id: r.uploaderId,
    storage_path: r.storagePath,
    file_name: r.fileName,
    mime_type: r.mimeType,
    duration_seconds: r.durationSeconds,
    created_at: r.createdAt,
  }))

  return { data: recordings, error: null }
}

export async function getRecording(recordingId: string) {
  const { data, error } = await api.recordings.get(recordingId)

  if (error) {
    throw new Error(error)
  }

  const recording = data ? {
    id: data.id || data.recordingId,
    meeting_id: data.meetingId,
    uploader_id: data.uploaderId,
    storage_path: data.storagePath,
    file_name: data.fileName,
    mime_type: data.mimeType,
    duration_seconds: data.durationSeconds,
    created_at: data.createdAt,
  } : null

  return { data: recording, error: null }
}

export async function getRecordingDownloadUrl(recording: Recording, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from('recordings')
    .createSignedUrl(recording.storage_path, expiresIn)

  if (error) {
    throw error
  }

  return { data: data.signedUrl, error: null }
}

export async function deleteRecording(recordingId: string) {
  const { error } = await api.recordings.delete(recordingId)

  if (error) {
    throw new Error(error)
  }

  return { error: null }
}

export interface TranscribeRecordingParams {
  recording_id: string
  language?: string
}

export interface TranscribeResult {
  success: boolean
  recording_id: string
  transcription_id: string
  meeting_id: string
  language: string
  text: string
}

export async function transcribeRecording({
  recording_id,
  language = 'en',
}: TranscribeRecordingParams): Promise<{ data: TranscribeResult | null; error: Error | null }> {
  const { data, error } = await api.transcribe({
    recordingId: recording_id,
    language,
  })

  if (error) {
    return { data: null, error: new Error(error) }
  }

  const result: TranscribeResult = {
    success: true,
    recording_id: data?.recordingId || recording_id,
    transcription_id: data?.transcriptionId || '',
    meeting_id: data?.meetingId || '',
    language: data?.language || language,
    text: data?.text || '',
  }

  return { data: result, error: null }
}
