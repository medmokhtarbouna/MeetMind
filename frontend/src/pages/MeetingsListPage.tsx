import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/DashboardLayout'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { Home, ChevronRight, Plus, Search, Filter, Video, Calendar, ArrowRight, FileText } from 'lucide-react'
import { listMyMeetings, getMeeting } from '../services/meetings'
import type { Database } from '../types/database'

type Meeting = Database['public']['Tables']['meetings']['Row']
type MeetingWithParticipants = Meeting & {
  participants?: Array<{ user_id: string }>
}

export function MeetingsListPage() {
  const [meetings, setMeetings] = useState<MeetingWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadMeetings() {
      try {
        setLoading(true)
        const { data } = await listMyMeetings()
        if (data) {
            const meetingsWithParticipants = await Promise.all(
            (data as Meeting[]).map(async (meeting) => {
              try {
                const { data: meetingData } = await getMeeting(meeting.id)
                return {
                  ...meeting,
                  participants: meetingData?.participants || [],
                }
              } catch {
                return { ...meeting, participants: [] }
              }
            })
          )
          setMeetings(meetingsWithParticipants)
        }
      } catch (error) {
        console.error('Error loading meetings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMeetings()
  }, [])

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getMeetingStatus = (_meeting: Meeting): 'Uploaded' | 'Processing' | 'Ready' | 'Failed' => {
    return 'Ready'
  }
  return (
    <DashboardLayout title="Meetings">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span className="px-2.5 py-1 rounded-full text-sm font-medium text-[var(--color-text)]">
            Meetings
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              All Meetings
            </h1>
            <p className="mt-1 text-base text-[var(--color-text-muted)]">
              View and manage all your meeting recordings and insights.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/meetings/new-text">
              <Button 
                size="sm" 
                variant="secondary"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Add meeting text
              </Button>
            </Link>
            <Link to="/meetings/new">
              <Button 
                size="sm" 
                leftIcon={<Plus className="h-4 w-4" />}
                className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent"
              >
                New meeting
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--bg-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#26b1b3]/20 focus:border-[#26b1b3] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--bg-surface)] text-sm text-[var(--color-text)] hover:bg-[var(--bg-subtle)] transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-primary)] border-r-transparent"></div>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">Loading meetings...</p>
          </div>
        )}

        {!loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMeetings.map((m) => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                className="group block rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-5 hover:shadow-md hover:border-[#26b1b3]/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[#26b1b3] transition-colors truncate">
                      {m.title}
                    </h3>
                  </div>
                  <StatusBadge status={getMeetingStatus(m)} />
                </div>

                <div className="space-y-2.5">
                  {m.description && (
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                      {m.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    {m.scheduled_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(m.scheduled_at)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(m.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5" />
                      <span>{m.participants?.length || 0} participants</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">View details</span>
                  <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[#26b1b3] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredMeetings.length === 0 && (
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--color-border)] p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                <Video className="h-8 w-8 text-[var(--color-text-muted)]" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  No meetings yet
                </p>
                <p className="text-sm text-[var(--color-text-muted)] max-w-md">
                  Upload your first meeting recording or connect your calendar to automatically sync meetings.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link to="/meetings/new">
                  <Button size="sm" className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent">
                    Upload meeting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

type Status = 'Uploaded' | 'Processing' | 'Ready' | 'Failed'

function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'Uploaded':
      return <Badge tone="info">Uploaded</Badge>
    case 'Processing':
      return <Badge tone="warning">Processing</Badge>
    case 'Ready':
      return <Badge tone="success">Ready</Badge>
    case 'Failed':
      return <Badge tone="danger">Failed</Badge>
    default:
      return <Badge>Unknown</Badge>
  }
}

