import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Button } from '../components/Button'
import { InputField } from '../components/InputField'
import { Home, ChevronRight, FileText, Calendar, Building2, Save, Sparkles, CheckCircle } from 'lucide-react'
import { createMeeting } from '../services/meetings'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export function NewMeetingTextPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [company, setCompany] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetingText, setMeetingText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const disabled = isSubmitting || !title.trim() || !meetingText.trim()

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a meeting title.')
      return
    }

    if (!meetingText.trim()) {
      setError('Please enter the meeting transcript text.')
      return
    }

    if (meetingText.trim().length < 50) {
      setError('Meeting text must be at least 50 characters.')
      return
    }

    if (!user) {
      setError('You must be logged in to create a meeting.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setProgress('Creating meeting...')

    try {
      const meetingResult = await createMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      })

      if (meetingResult.error || !meetingResult.data) {
        throw meetingResult.error || new Error('Failed to create meeting')
      }

      const meetingId = meetingResult.data.id
      setProgress('Analyzing meeting text with AI...')

      const processResult = await api.processMeetingText({
        meetingId,
        text: meetingText.trim(),
        language: 'en',
      })

      if (processResult.error) {
        throw new Error(processResult.error)
      }

      setProgress('Done! Redirecting...')
      setSuccess(true)

      // Navigate to the meeting details page immediately
      navigate(`/meetings/${meetingId}`)

    } catch (err: any) {
      console.error('Error processing meeting:', err)
      setError(err.message || 'Failed to process meeting. Please try again.')
      setIsSubmitting(false)
      setProgress('')
    }
  }

  return (
    <DashboardLayout title="Add meeting text">
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
            Add Meeting Text
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Add meeting text
            </h1>
            <p className="mt-1 text-base text-[var(--color-text-muted)]">
              Manually add a meeting transcript to get AI-powered insights, summaries, and follow-up suggestions.
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#26b1b3]" />
                <label className="text-base font-semibold text-[var(--color-text)]">
                  Meeting transcript
                </label>
              </div>
              
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-surface)]">
                <textarea
                  value={meetingText}
                  onChange={(e) => setMeetingText(e.target.value)}
                  placeholder="Paste or type the meeting transcript here..."
                  rows={12}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl border-0 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#26b1b3]/20 resize-none disabled:opacity-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">
                  The transcript will be analyzed to extract insights, summaries, action items, and follow-up suggestions.
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {meetingText.length} characters
                </p>
              </div>
            </div>

            {isSubmitting && (
              <div className="rounded-xl border border-[#26b1b3]/30 bg-[#26b1b3]/5 p-4">
                <div className="flex items-center gap-3">
                  {success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-[#26b1b3] animate-pulse" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      {progress}
                    </p>
                    {!success && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        This may take a few seconds...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm text-rose-600">{error}</p>
              </div>
            )}

            <div className="pt-6 border-t border-[var(--color-border)] space-y-3">
              {disabled && !isSubmitting && (
                <div className="text-xs text-[var(--color-text-muted)] bg-[var(--bg-subtle)] rounded-lg p-2">
                  {!title.trim() && <p>• Please enter a meeting title</p>}
                  {!meetingText.trim() && <p>• Please enter the meeting transcript text</p>}
                  {meetingText.trim().length > 0 && meetingText.trim().length < 50 && (
                    <p>• Meeting text must be at least 50 characters</p>
                  )}
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  type="button"
                  onClick={() => navigate('/meetings')}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[120px] px-6 py-3"
                >
                  Cancel
                </Button>
                <Button
                  size="md"
                  type="button"
                  disabled={disabled || meetingText.trim().length < 50}
                  onClick={handleSubmit}
                  className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent disabled:bg-[#26b1b3]/50 disabled:text-white/70 disabled:cursor-not-allowed w-full sm:w-auto min-w-[180px] px-6 py-3"
                  leftIcon={!isSubmitting ? <Save className="h-4 w-4" /> : <Sparkles className="h-4 w-4 animate-spin" />}
                >
                  {isSubmitting ? 'Processing...' : 'Save & Analyze'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
