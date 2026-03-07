import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Button } from '../components/Button'
import { InputField } from '../components/InputField'
import { Dialog } from '../components/Dialog'
import { Home, ChevronRight, Upload, X, FileVideo, Calendar, Building2, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { createMeeting } from '../services/meetings'
import { uploadRecordingFile } from '../services/recordings'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Meeting = Database['public']['Tables']['meetings']['Row']

export function NewMeetingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [company, setCompany] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [error, setError] = useState('')
  const [showQuotaDialog, setShowQuotaDialog] = useState(false)

  const disabled = isSubmitting || !selectedFile || !title.trim()

  return (
    <DashboardLayout title="New meeting">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          <Link to="/meetings" className="px-2.5 py-1 rounded-full text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            Meetings
          </Link>
          <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span className="px-2.5 py-1 rounded-full text-sm font-medium text-[var(--color-text)]">
            New Meeting
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Upload a new meeting
            </h1>
            <p className="mt-1 text-base text-[var(--color-text-muted)]">
              Add a meeting recording to get AI-powered insights, transcripts, and follow-up suggestions.
            </p>
          </div>
        </div>

        <div className="w-full">
        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)] space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#26b1b3]" />
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Meeting details</h2>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] mb-2">
                  <Building2 className="h-4 w-4 text-[var(--color-text-muted)]" />
                  Company
                </label>
              <InputField
                name="company"
                label=""
                placeholder="Select or enter company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] mb-2">
                  <Calendar className="h-4 w-4 text-[var(--color-text-muted)]" />
                  Meeting date
                </label>
              <InputField
                name="date"
                label=""
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] mb-2">
                <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
                Meeting title
              </label>
              <InputField
                name="title"
                label=""
                placeholder="e.g., Quarterly business review with Northwind"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text)] mb-2">
                <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
                Description (optional)
              </label>
              <InputField
                name="description"
                label=""
                placeholder="Add meeting notes or description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#26b1b3]" />
              <label className="text-base font-semibold text-[var(--color-text)]">
                Recording upload
              </label>
            </div>
            
            <div 
              className="border-2 border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--bg-subtle)] p-8 text-center hover:border-[#26b1b3]/50 transition-colors"
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) {
                  setSelectedFile(file)
                  setFileName(file.name)
                  setError('')
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
              }}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-[#26b1b3]/10 flex items-center justify-center">
                  <FileVideo className="h-8 w-8 text-[#26b1b3]" />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-medium text-[var(--color-text)]">
                    Drag &amp; drop your file here
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    or{' '}
                    <label htmlFor="file-upload" className="text-[#26b1b3] hover:text-[#26b1b3]/80 cursor-pointer font-medium">
                      browse files
                    </label>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    MP4, WebM, MP3, WAV up to 2 hours
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    We&apos;ll automatically transcribe and detect signals
                  </p>
                </div>
                <input
                  type="file"
                  accept="video/*,audio/*,.mp4,.webm,.mp3,.wav,.m4a,.ogg"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      setFileName(file.name)
                      setError('')
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<Upload className="h-4 w-4" />}
                  className="cursor-pointer"
                  type="button"
                  onClick={() => {
                    document.getElementById('file-upload')?.click()
                  }}
                >
                  Choose file
                </Button>
              </div>
            </div>

            {fileName && (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--color-text)] truncate">
                        {fileName}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {progress === 0
                          ? 'Ready to upload'
                          : `Uploading… ${Math.round(progress)}%`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFileName(null)
                      setSelectedFile(null)
                      setProgress(0)
                    }}
                    className="h-8 w-8 rounded-lg hover:bg-[var(--bg-subtle)] flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          )}

          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Upload progress</span>
                <span className="font-medium text-[var(--color-text)]">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#26b1b3] to-[#26b1b3]/80 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[var(--color-border)] space-y-3">
            {disabled && !isSubmitting && (
              <div className="text-xs text-[var(--color-text-muted)] bg-[var(--bg-subtle)] rounded-lg p-2">
                {!title.trim() && <p>• Please enter a meeting title</p>}
                {!selectedFile && <p>• Please select a file to upload</p>}
              </div>
            )}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => navigate('/meetings')}
                className="w-full sm:w-auto min-w-[120px] px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                size="md"
                type="button"
                disabled={disabled}
                onClick={async () => {
                if (!selectedFile) {
                  setError('Please select a file to upload.')
                  return
                }
                
                if (!title.trim()) {
                  setError('Please enter a meeting title.')
                  return
                }
                
                if (!user) {
                  setError('You must be logged in to create a meeting.')
                  return
                }

                setIsSubmitting(true)
                setError('')
                setProgress(5)

                try {
                  const result = await createMeeting({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
                  })

                  if (result.error || !result.data) {
                    throw result.error || new Error('Failed to create meeting')
                  }

                  const meeting = result.data as Meeting
                  const meetingId = meeting.id
                  setProgress(20)

                  try {
                    const uploadResult = await uploadRecordingFile({
                      meeting_id: meetingId,
                      file: selectedFile,
                      onProgress: (uploadProgress) => {
                        // Map upload progress (0-100) to our progress range (20-60)
                        const mappedProgress = 20 + (uploadProgress * 0.4)
                        setProgress(Math.min(mappedProgress, 60))
                      },
                    })
                    if (!uploadResult.data) {
                      throw new Error('Failed to upload recording')
                    }
                  } catch (uploadErr) {
                    throw uploadErr instanceof Error ? uploadErr : new Error('Failed to upload recording')
                  }

                  setProgress(65)

                  setShowQuotaDialog(true)
                  setIsSubmitting(false)
                  setProgress(0)
                  return
                } catch (err: any) {
                  console.error('Upload error:', err)
                  const errorMessage = (err.message || '').toLowerCase()
                  const isQuotaError = 
                    errorMessage.includes('quota') || 
                    errorMessage.includes('429') || 
                    errorMessage.includes('insufficient_quota') ||
                    errorMessage.includes('exceeded')
                  
                  if (isQuotaError) {
                    setShowQuotaDialog(true)
                    setIsSubmitting(false)
                    setProgress(0)
                    return
                  } else {
                    setError(err.message || 'Failed to upload meeting. Please try again.')
                    setIsSubmitting(false)
                    setProgress(0)
                  }
                }
              }}
              className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent disabled:bg-[#26b1b3]/50 disabled:text-white/70 disabled:cursor-not-allowed w-full sm:w-auto min-w-[180px] px-6 py-3"
              leftIcon={!isSubmitting && <Upload className="h-4 w-4" />}
            >
              {isSubmitting ? 'Uploading…' : 'Create & upload'}
            </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showQuotaDialog}
        onClose={() => setShowQuotaDialog(false)}
        title="OpenAI API Quota Exceeded"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setShowQuotaDialog(false)}
              className="min-w-[100px]"
            >
              Close
            </Button>
            <Button
              size="md"
              type="button"
              onClick={() => {
                setShowQuotaDialog(false)
                navigate('/meetings/new-text')
              }}
              className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent min-w-[160px]"
            >
              Add meeting text
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-base text-[var(--color-text)]">
                The OpenAI API quota has been exceeded. This means the transcription service is temporarily unavailable.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-[var(--bg-subtle)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              <strong className="text-[var(--color-text)]">Alternative solution:</strong> You can add the meeting transcript manually using the "Add meeting text" option. This will allow you to still get AI-powered summaries and insights from your meeting text.
            </p>
          </div>
        </div>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}

