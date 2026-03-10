import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Button } from '../components/Button'
import { InputField } from '../components/InputField'
import {
  Home,
  ChevronRight,
  FileText,
  Calendar,
  Building2,
  Save,
  Sparkles,
  CheckCircle,
  Wand2,
  Eraser,
} from 'lucide-react'
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
  const [isSampleActive, setIsSampleActive] = useState(false)

  const applyRandomSample = () => {
    const randomSample =
      SAMPLE_MEETINGS[Math.floor(Math.random() * SAMPLE_MEETINGS.length)]

    setCompany(randomSample.company)
    setScheduledAt(new Date(randomSample.meetingDate).toISOString().slice(0, 16))
    setTitle(randomSample.title)
    setDescription(randomSample.description)
    setMeetingText(randomSample.transcript)
  }

  useEffect(() => {
    // Prefill form with a random sample meeting on first render
    applyRandomSample()
    setIsSampleActive(true)
  }, [])

  const handleSampleToggle = () => {
    if (isSampleActive) {
      // Clear all fields
      setCompany('')
      setScheduledAt('')
      setTitle('')
      setDescription('')
      setMeetingText('')
      setIsSampleActive(false)
    } else {
      // Apply a new random sample
      applyRandomSample()
      setIsSampleActive(true)
    }
  }

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

    if (meetingText.length > 3000) {
      setError('Meeting text must not exceed 3000 characters.')
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

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent"
              onClick={handleSampleToggle}
              disabled={isSubmitting}
              leftIcon={
                isSampleActive ? (
                  <Eraser className="h-4 w-4" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )
              }
            >
              {isSampleActive ? 'Clear sample content' : 'Use sample content'}
            </Button>
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
                  onChange={(e) => {
                    if (e.target.value.length <= 3000) {
                      setMeetingText(e.target.value)
                    }
                  }}
                  placeholder="Paste or type the meeting transcript here..."
                  rows={12}
                  maxLength={3000}
                  disabled={isSubmitting}
                  className="w-full p-4 rounded-xl border-0 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#26b1b3]/20 resize-none disabled:opacity-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-muted)]">
                  The transcript will be analyzed to extract insights, summaries, action items, and follow-up suggestions.
                </p>
                <p className={`text-xs ${meetingText.length > 3000 ? 'text-rose-600' : meetingText.length > 2500 ? 'text-amber-600' : 'text-[var(--color-text-muted)]'}`}>
                  {meetingText.length} / 3000 characters
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
                  {meetingText.length > 3000 && (
                    <p>• Meeting text must not exceed 3000 characters</p>
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
                  disabled={disabled || meetingText.trim().length < 50 || meetingText.length > 3000}
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

const SAMPLE_MEETINGS = [
  {
    company: 'Northwind Technologies',
    meetingDate: '2026-03-10T09:30:00Z',
    title: 'AI Product Stability Review',
    description:
      'Internal meeting to evaluate the readiness of the meeting intelligence platform before a client demo.',
    transcript:
      "Alex:\nGood morning everyone. Today we need to review the current state of the meeting intelligence platform before the client demo scheduled for next week. The goal is to ensure the core workflow is reliable and that the AI summaries provide clear value to users.\nSarah:\nFrom a product perspective the workflow is mostly complete. A user can create a meeting, upload an audio file, generate a transcript, and then receive a structured summary including action items and key points.\nDavid:\nThe main concern right now is upload reliability. When the connection drops the recording upload can fail and the user sometimes has to start again from the beginning.\nLina:\nI agree. The interface currently only shows a spinner. We should instead display messages like “Uploading recording” or “Generating transcript” so the user understands what is happening.\nMark:\nDuring a demo that kind of clarity is important because clients tend to judge the system based on how confident and stable it appears.\nAlex:\nLet’s also talk about summary quality. Sarah have you reviewed the last set of AI outputs?\nSarah:\nYes. They are useful but sometimes too generic. They summarize the conversation but occasionally miss concrete decisions or assigned tasks.\nDavid:\nTechnically we can improve that by strengthening the prompt and forcing the model to extract decisions and responsibilities explicitly.\nAlex:\nGreat. For this week our priorities are improving upload stability, refining the summary prompt, and preparing a clean demo workflow.\nSarah:\nThat sounds good. I will review the prompt templates and test a few variations.\nDavid:\nI will implement retry logic for uploads and improve backend status tracking.\nLina:\nI will redesign the processing indicators in the UI.\nMark:\nAnd I will prepare demo scenarios so we can show realistic meetings.\nAlex:\nPerfect. Let’s review progress again in two days.",
  },
  {
    company: 'BlueWave Consulting',
    meetingDate: '2026-03-11T14:00:00Z',
    title: 'Client Demo Preparation Meeting',
    description:
      'Discussion about improving reliability and preparing the platform for upcoming client demonstrations.',
    transcript:
      "Emma:\nThanks everyone for joining. Our objective today is to finalize the preparation for the upcoming client demonstration of the meeting intelligence system.\nDaniel:\nThe good news is that the core pipeline is working. Audio recordings are uploaded successfully and the transcription service is producing accurate transcripts.\nSophia:\nHowever the summaries sometimes feel too high level. They capture the general idea but they do not always highlight concrete decisions or follow up tasks.\nLucas:\nAnother issue is that users do not always understand what the system is doing while the meeting is being processed.\nEmma:\nYes that feedback has come up during internal testing as well.\nSophia:\nWe should show progress messages like “Transcribing meeting” and “Analyzing discussion”. That will make the platform feel more transparent.\nDaniel:\nOn the backend side the architecture is solid. The transcript is generated first and then passed to the AI summarization stage.\nLucas:\nWe can improve the structure of the output so that it consistently includes key points, decisions, and tasks.\nEmma:\nExactly. The value of the product is not just summarizing meetings but turning them into actionable insights.\nSophia:\nIf we highlight tasks and responsibilities clearly the system becomes much more useful for teams.\nDaniel:\nI will update the prompt structure so the AI focuses on extracting decisions and assignments.\nLucas:\nI will also review the API responses to make sure the frontend receives consistent structured data.\nEmma:\nGreat. Let’s finalize these improvements before Friday so we can rehearse the demo with realistic meeting examples.",
  },
  {
    company: 'Vertex Analytics',
    meetingDate: '2026-03-12T10:15:00Z',
    title: 'Platform Reliability Discussion',
    description:
      'Internal review of system stability and AI output quality before product presentation.',
    transcript:
      "Michael:\nToday we want to focus on platform reliability and the quality of AI generated insights.\nAnna:\nThe system already produces useful summaries but there are moments where the output misses subtle decisions made during the meeting.\nChris:\nThat might be related to how the prompts interpret conversational context.\nJulia:\nFrom the user experience side the results page could also be clearer. Right now the summary appears as a block of text.\nMichael:\nWe should restructure the output so users can quickly see key points and action items.\nAnna:\nYes especially for long meetings people want to immediately identify responsibilities and deadlines.\nChris:\nTechnically that is easy to implement because the AI pipeline already extracts structured elements.\nJulia:\nWe just need to present them visually in a clearer layout.\nMichael:\nAnother topic is processing time. Some meetings take longer than expected to analyze.\nAnna:\nWe could parallelize parts of the pipeline so the analysis step runs faster.\nChris:\nThat would definitely improve perceived performance.\nJulia:\nUsers are much more patient when they see clear progress indicators.\nMichael:\nSo the plan is to improve prompt precision, restructure the results page, and optimize the processing pipeline.\nAnna:\nI will start with prompt experiments.\nChris:\nI will review the processing architecture.\nJulia:\nAnd I will design a clearer results layout.",
  },
  {
    company: 'CloudBridge Systems',
    meetingDate: '2026-03-13T16:00:00Z',
    title: 'Meeting Intelligence Product Review',
    description:
      'Product meeting to refine AI summaries and improve the user workflow before the next release.',
    transcript:
      "Ryan:\nThanks for joining this product review session. Our focus today is to evaluate how well the meeting intelligence platform converts conversations into structured insights.\nOlivia:\nFrom user feedback we know that people appreciate the automatic summaries but they want clearer identification of decisions and next steps.\nNathan:\nThe backend already extracts those elements but they are not always displayed prominently in the interface.\nGrace:\nExactly. If the user has to read the entire summary to find tasks it reduces the practical value of the tool.\nRyan:\nWe should design the results page so the first things visible are decisions and action items.\nOlivia:\nThat will make the system much more useful for project teams.\nNathan:\nAnother idea is to categorize insights into sections like key points, decisions, and responsibilities.\nGrace:\nYes that would also make the reports easier to read.\nRyan:\nLet’s also consider export features for the future such as exporting summaries to PDF or project management tools.\nOlivia:\nThat would integrate well with team workflows.\nNathan:\nFrom the technical side we can easily add export endpoints later.\nGrace:\nFor now the main improvement should be clarity of results.\nRyan:\nAgreed. Let’s prioritize improving the output structure and preparing sample meetings for the next release demonstration.",
  },
  {
    company: 'OrbitTech Labs',
    meetingDate: '2026-03-14T11:45:00Z',
    title: 'AI Workflow Optimization',
    description:
      'Team discussion focused on improving meeting processing reliability and summary accuracy.',
    transcript:
      "Kevin:\nThe objective of today’s meeting is to review how our AI pipeline processes meeting content and identify opportunities for optimization.\nLaura:\nThe transcription stage is working reliably but the summarization stage sometimes produces outputs that are too brief.\nJames:\nWe should encourage the model to capture more context including motivations behind decisions.\nMaya:\nAnother issue is that responsibilities are not always clearly assigned in the summary.\nKevin:\nThat is important because the product’s value comes from turning discussions into concrete follow up actions.\nLaura:\nMaybe the prompt should explicitly ask the model to identify who is responsible for each task.\nJames:\nThat would make the generated tasks much more actionable.\nMaya:\nWe should also track confidence levels for extracted decisions.\nKevin:\nInteresting idea. That could help users quickly assess which insights are reliable.\nLaura:\nFrom a usability standpoint the interface should highlight the most important outcomes first.\nJames:\nYes users should immediately see tasks and decisions without reading the full transcript.\nMaya:\nIf we combine clearer prompts with better presentation the platform will feel much more powerful.\nKevin:\nAgreed. Let’s experiment with improved prompts and evaluate the results later this week.",
  },
] as const