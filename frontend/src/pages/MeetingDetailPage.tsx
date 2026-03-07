import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Tabs, TabPanel } from '../components/Tabs'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { api } from '../lib/api'
import { 
  Home, 
  ChevronRight, 
  Calendar, 
  Users, 
  Download,
  CheckCircle2,
  AlertCircle,
  Target,
  MessageSquare,
  FileText,
  Loader2,
  Lightbulb,
  Tag,
  Check,
  Copy
} from 'lucide-react'

interface ActionItem {
  title: string
  owner: string | null
  deadline: string | null
}

interface Task {
  id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  assignedTo: string | null
  deadline: string | null
}

interface MeetingIntelligence {
  meetingId: string
  title: string
  description: string | null
  scheduledAt: string | null
  createdAt: string
  owner: {
    id: string
    email: string
    fullName: string | null
  }
  participants: Array<{
    userId: string
    email: string
    fullName: string | null
    role: string
  }>
  recordings: Array<{
    recordingId: string
    fileName: string
    mimeType: string
    durationSeconds: number
    createdAt: string
  }>
  transcript: string | null
  summary: string | null
  actionItems: ActionItem[]
  decisions: string[]
  keyPoints: string[]
  keywords: string[]
  tasks: Task[]
}

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<'insights' | 'transcript' | 'chat'>('insights')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<MeetingIntelligence | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchMeetingData() {
      if (!id) return
      
      setLoading(true)
      setError(null)

      try {
        const { data: result, error: apiError } = await api.meetings.getIntelligence(id)
        
        if (apiError) {
          throw new Error(apiError)
        }

        console.log('Meeting Intelligence Data:', result)
        setData(result)
      } catch (err: any) {
        console.error('Error fetching meeting:', err)
        setError(err.message || 'Failed to load meeting data')
      } finally {
        setLoading(false)
      }
    }

    fetchMeetingData()
  }, [id])

  const handleExport = () => {
    if (!data) return

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    let content = `MEETING EXPORT
===============
Title: ${data.title}
Date: ${formatDate(data.scheduledAt || data.createdAt)}
${data.description ? `Description: ${data.description}` : ''}

`

    if (data.summary) {
      content += `SUMMARY
-------
${data.summary}

`
    }

    if (data.actionItems && data.actionItems.length > 0) {
      content += `ACTION ITEMS
------------
${data.actionItems.map((item, i) => `${i + 1}. ${item.title}${item.owner ? ` (Owner: ${item.owner})` : ''}${item.deadline ? ` - Due: ${item.deadline}` : ''}`).join('\n')}

`
    }

    if (data.keyPoints && data.keyPoints.length > 0) {
      content += `KEY POINTS
----------
${data.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

`
    }

    if (data.decisions && data.decisions.length > 0) {
      content += `DECISIONS
---------
${data.decisions.map((decision, i) => `${i + 1}. ${decision}`).join('\n')}

`
    }

    if (data.tasks && data.tasks.length > 0) {
      content += `TASKS
-----
${data.tasks.map((task, i) => `${i + 1}. [${task.status.toUpperCase()}] ${task.title}`).join('\n')}

`
    }

    if (data.keywords && data.keywords.length > 0) {
      content += `KEYWORDS
--------
${data.keywords.join(', ')}

`
    }

    if (data.transcript) {
      content += `TRANSCRIPT
----------
${data.transcript}
`
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${data.title.replace(/[^a-z0-9]/gi, '_')}_export.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (!data) return

    let shareText = `📋 Meeting: ${data.title}\n`
    shareText += `📅 Date: ${data.scheduledAt ? new Date(data.scheduledAt).toLocaleDateString() : new Date(data.createdAt).toLocaleDateString()}\n\n`

    if (data.summary) {
      shareText += `📝 Summary:\n${data.summary}\n\n`
    }

    if (data.actionItems && data.actionItems.length > 0) {
      shareText += `✅ Action Items:\n${data.actionItems.map((item, i) => `${i + 1}. ${item.title}`).join('\n')}\n\n`
    }

    if (data.keyPoints && data.keyPoints.length > 0) {
      shareText += `💡 Key Points:\n${data.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}\n`
    }

    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Meeting details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#26b1b3]" />
            <p className="text-sm text-[var(--color-text-muted)]">Loading meeting data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout title="Meeting details">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Failed to load meeting</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{error || 'Meeting not found'}</p>
            </div>
            <Link to="/meetings">
              <Button variant="secondary">Back to Meetings</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const hasSummary = data.summary || (data.actionItems && data.actionItems.length > 0) || 
                     (data.keyPoints && data.keyPoints.length > 0) || 
                     (data.decisions && data.decisions.length > 0)

  return (
    <DashboardLayout title="Meeting details">
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
            {data.title}
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              {data.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(data.scheduledAt || data.createdAt)}</span>
              </div>
              {data.participants && data.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{data.participants.length + 1} participants</span>
                </div>
              )}
              {data.tasks && data.tasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{data.tasks.length} tasks</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              Export
            </Button>
            <Button 
              size="sm"
              leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              className={`${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#26b1b3] hover:bg-[#26b1b3]/90'} text-white border-transparent transition-colors`}
              onClick={handleShare}
            >
              {copied ? 'Copied!' : 'Copy summary'}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge tone={hasSummary ? 'success' : 'warning'} className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {hasSummary ? 'Analyzed' : 'Pending Analysis'}
                </Badge>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Created {formatDate(data.createdAt)}
                </span>
              </div>
              {data.description && (
                <p className="text-sm text-[var(--color-text-muted)]">{data.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <Tabs
            tabs={[
              { id: 'insights', label: 'Insights' },
              { id: 'transcript', label: 'Transcript' },
              { id: 'chat', label: 'Chat' },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as typeof activeTab)}
          />

          <TabPanel activeId={activeTab} whenActive="insights">
            <InsightsTab data={data} />
          </TabPanel>
          <TabPanel activeId={activeTab} whenActive="transcript">
            <TranscriptTab transcript={data.transcript} />
          </TabPanel>
          <TabPanel activeId={activeTab} whenActive="chat">
            <ChatTab />
          </TabPanel>
        </div>
      </div>
    </DashboardLayout>
  )
}

function InsightsTab({ data }: { data: MeetingIntelligence }) {
  const hasSummary = data.summary || (data.actionItems && data.actionItems.length > 0) || 
                     (data.keyPoints && data.keyPoints.length > 0) || 
                     (data.decisions && data.decisions.length > 0)

  if (!hasSummary) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-[var(--color-text-muted)] mb-4" />
        <h3 className="text-lg font-semibold text-[var(--color-text)]">No insights available</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          This meeting hasn't been analyzed yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {data.summary && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-[#26b1b3]" />
            <div className="text-base font-semibold text-[var(--color-text)]">Executive Summary</div>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
            {data.summary}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {data.actionItems && data.actionItems.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-emerald-600" />
              <div className="text-base font-semibold text-[var(--color-text)]">Action Items</div>
              <Badge tone="success" className="ml-auto">{data.actionItems.length}</Badge>
            </div>
            <ul className="space-y-3">
              {data.actionItems.map((item, idx) => (
                <li key={idx} className="flex gap-3 p-3 rounded-xl bg-[var(--bg-subtle)]">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                  <div className="flex-1">
                    <span className="text-sm text-[var(--color-text)] leading-relaxed">{item.title}</span>
                    {(item.owner || item.deadline) && (
                      <div className="flex gap-4 mt-1 text-xs text-[var(--color-text-muted)]">
                        {item.owner && <span>Owner: {item.owner}</span>}
                        {item.deadline && <span>Due: {item.deadline}</span>}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.tasks && data.tasks.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-blue-600" />
              <div className="text-base font-semibold text-[var(--color-text)]">Tasks</div>
              <Badge tone="info" className="ml-auto">{data.tasks.length}</Badge>
            </div>
            <ul className="space-y-3">
              {data.tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-subtle)]">
                  <div className={`h-2 w-2 rounded-full ${
                    task.status === 'done' ? 'bg-emerald-500' : 
                    task.status === 'doing' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-[var(--color-text)] flex-1">{task.title}</span>
                  <Badge tone={task.status === 'done' ? 'success' : task.status === 'doing' ? 'warning' : 'neutral'}>
                    {task.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.keyPoints && data.keyPoints.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <div className="text-base font-semibold text-[var(--color-text)]">Key Points</div>
              <Badge tone="warning" className="ml-auto">{data.keyPoints.length}</Badge>
            </div>
            <ul className="space-y-3">
              {data.keyPoints.map((point, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-[var(--color-text-muted)] leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.decisions && data.decisions.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              <div className="text-base font-semibold text-[var(--color-text)]">Decisions Made</div>
              <Badge tone="info" className="ml-auto">{data.decisions.length}</Badge>
            </div>
            <ul className="space-y-3">
              {data.decisions.map((decision, idx) => (
                <li key={idx} className="flex gap-3 p-3 rounded-xl bg-purple-50">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
                  <span className="text-sm text-[var(--color-text)] leading-relaxed">{decision}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.keywords && data.keywords.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-[#26b1b3]" />
            <div className="text-base font-semibold text-[var(--color-text)]">Keywords</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.keywords.map((keyword, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 rounded-full text-sm bg-[#26b1b3]/10 text-[#26b1b3] font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TranscriptTab({ transcript }: { transcript: string | null }) {
  if (!transcript) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-[var(--color-text-muted)] mb-4" />
        <h3 className="text-lg font-semibold text-[var(--color-text)]">No transcript available</h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          The transcript for this meeting hasn't been generated yet.
        </p>
      </div>
    )
  }

  const lines = transcript.split('\n').filter(line => line.trim())
  const segments: Array<{ speaker: string; text: string }> = []
  
  let currentSpeaker = 'Meeting'
  let currentText: string[] = []

  for (const line of lines) {
    const speakerMatch = line.match(/^([A-Za-z]+(?:\s*\([^)]+\))?)\s*:(.*)/)
    
    if (speakerMatch) {
      if (currentText.length > 0) {
        segments.push({ speaker: currentSpeaker, text: currentText.join('\n') })
        currentText = []
      }
      currentSpeaker = speakerMatch[1].trim()
      const remainingText = speakerMatch[2].trim()
      if (remainingText) {
        currentText.push(remainingText)
      }
    } else {
      currentText.push(line)
    }
  }
  
  if (currentText.length > 0) {
    segments.push({ speaker: currentSpeaker, text: currentText.join('\n') })
  }

  if (segments.length === 0) {
    segments.push({ speaker: 'Meeting', text: transcript })
  }

  return (
    <div className="mt-6 max-h-[600px] overflow-y-auto space-y-4 pr-2">
      {segments.map((seg, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#26b1b3] to-[#26b1b3]/80 flex items-center justify-center text-white text-xs font-semibold">
              {seg.speaker.charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-sm text-[var(--color-text)]">{seg.speaker}</div>
          </div>
          <p className="text-sm text-[var(--color-text)] leading-relaxed pl-10 whitespace-pre-wrap">{seg.text}</p>
        </div>
      ))}
    </div>
  )
}

function ChatTab() {
  const [input, setInput] = useState('')

  const messages: Array<{
    id: number
    from: 'ai' | 'user'
    text: string
  }> = [
    {
      id: 1,
      from: 'ai',
      text: 'Hi! I\'ve analyzed this meeting. How can I help you with the insights?',
    },
  ]

  return (
    <div className="mt-6 flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                m.from === 'user'
                  ? 'bg-[#26b1b3] text-white rounded-br-md'
                  : 'bg-[var(--bg-subtle)] text-[var(--color-text)] rounded-bl-md border border-[var(--color-border)]'
              }`}
            >
              {m.from === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-[#26b1b3]" />
                  <span className="text-xs font-semibold text-[var(--color-text)]">AI Assistant</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form
        className="mt-auto border-t border-[var(--color-border)] pt-4 flex items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          setInput('')
        }}
      >
        <input
          className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#26b1b3]/20 focus:border-[#26b1b3] transition-all"
          placeholder="Ask a question about this meeting…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button 
          size="sm" 
          disabled={!input}
          className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent disabled:opacity-50"
        >
          Send
        </Button>
      </form>
    </div>
  )
}
