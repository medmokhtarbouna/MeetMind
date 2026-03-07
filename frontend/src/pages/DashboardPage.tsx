import { useState, useEffect } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import {
  TrendingUp,
  Video,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Plus,
  Home,
  ChevronRight,
  Sparkles,
  Target,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { listMyMeetings } from '../services/meetings'
import { listTasksByMeeting } from '../services/tasks'
import type { Database } from '../types/database'

type Meeting = Database['public']['Tables']['meetings']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

export function DashboardPage() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const { data: meetingsData } = await listMyMeetings()
        setMeetings(meetingsData || [])

        if (meetingsData && meetingsData.length > 0) {
          const allTasks: Task[] = []
          for (const meeting of meetingsData as Meeting[]) {
            const { data: tasksData } = await listTasksByMeeting(meeting.id)
            if (tasksData) {
              allTasks.push(...tasksData)
            }
          }
          setTasks(allTasks)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  const totalMeetings = meetings.length
  
  const meetingsLast7Days = meetings.filter((m) => {
    const meetingDate = new Date(m.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return meetingDate >= sevenDaysAgo
  }).length

  const meetingsThisMonth = meetings.filter((m) => {
    const meetingDate = new Date(m.created_at)
    const now = new Date()
    return meetingDate.getMonth() === now.getMonth() && 
           meetingDate.getFullYear() === now.getFullYear()
  }).length

  const meetingsLastMonth = meetings.filter((m) => {
    const meetingDate = new Date(m.created_at)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    return meetingDate >= lastMonth && meetingDate <= lastMonthEnd
  }).length

  const percentageChange = meetingsLastMonth > 0 
    ? Math.round(((meetingsThisMonth - meetingsLastMonth) / meetingsLastMonth) * 100)
    : meetingsThisMonth > 0 ? 100 : 0

  const todoTasks = tasks.filter((t) => t.status === 'todo').length
  const doingTasks = tasks.filter((t) => t.status === 'doing').length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const totalTasks = tasks.length

  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Dashboard home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span className="px-2.5 py-1 rounded-full text-sm font-medium text-[var(--color-text)] bg-[var(--bg-subtle)] border border-[var(--color-border)]">
            Dashboard
          </span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">
              Welcome back, {userName}
            </h1>
            <p className="mt-1 text-base text-[var(--color-text-muted)]">
              Your meeting intelligence hub — transcripts, signals, deal confidence, and follow-ups in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/meetings/new-text">
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<FileText className="h-4 w-4" />}
                className="rounded-full"
              >
                Add meeting text
              </Button>
            </Link>

            <Link to="/meetings/new">
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                className="rounded-full bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent"
              >
                Upload meeting
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-muted)] mb-1 font-medium">
                  Total meetings
                </div>
                <div className="text-4xl font-semibold text-[var(--color-text)]">
                  {loading ? '...' : totalMeetings}
                </div>
                {!loading && (
                  <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                    percentageChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    <TrendingUp className={`h-4 w-4 ${percentageChange < 0 ? 'rotate-180' : ''}`} />
                    <span>{percentageChange >= 0 ? '+' : ''}{percentageChange}% vs last month</span>
                  </div>
                )}
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {meetingsThisMonth} this month, {meetingsLastMonth} last month
                </div>
              </div>

              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-muted)] mb-1 font-medium">
                  Meetings (last 7 days)
                </div>
                <div className="text-4xl font-semibold text-[var(--color-text)]">
                  {loading ? '...' : meetingsLast7Days}
                </div>
                <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                  {meetingsLast7Days > 0 
                    ? `${meetingsLast7Days} meeting${meetingsLast7Days > 1 ? 's' : ''} analyzed`
                    : 'No meetings this week'}
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Speaker-separated transcript + signals.
                </div>
              </div>

              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-[var(--color-text-muted)] mb-1 font-medium">
                  Pending tasks
                </div>
                <div className="text-4xl font-semibold text-[var(--color-text)]">
                  {loading ? '...' : todoTasks}
                </div>
                <div className="mt-2 text-xs font-medium text-amber-600">
                  {doingTasks > 0 && `${doingTasks} in progress`}
                  {doingTasks > 0 && doneTasks > 0 && ' • '}
                  {doneTasks > 0 && `${doneTasks} completed`}
                  {doingTasks === 0 && doneTasks === 0 && 'No tasks yet'}
                </div>
                <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {totalTasks} total tasks from {totalMeetings} meeting{totalMeetings !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)] lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Task progress
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Overview of all tasks from your meetings
                </p>
              </div>
              <div className="h-11 w-11 rounded-xl bg-[#26b1b3]/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#26b1b3]" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-subtle)] p-4">
                <div className="text-xs text-[var(--color-text-muted)]">To Do</div>
                <div className="mt-1 text-2xl font-semibold text-gray-600">
                  {loading ? '...' : todoTasks}
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-500 rounded-full transition-all"
                    style={{ width: totalTasks > 0 ? `${(todoTasks / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-subtle)] p-4">
                <div className="text-xs text-[var(--color-text-muted)]">In Progress</div>
                <div className="mt-1 text-2xl font-semibold text-amber-600">
                  {loading ? '...' : doingTasks}
                </div>
                <div className="mt-2 h-2 bg-amber-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: totalTasks > 0 ? `${(doingTasks / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--bg-subtle)] p-4">
                <div className="text-xs text-[var(--color-text-muted)]">Completed</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-600">
                  {loading ? '...' : doneTasks}
                </div>
                <div className="mt-2 h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: totalTasks > 0 ? `${(doneTasks / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <h3 className="text-base font-semibold text-[var(--color-text)]">
              Next best action
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Upload a meeting to get transcript, signals, deal probability, and a follow-up draft.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link to="/meetings/new">
                <Button className="w-full bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent">
                  Upload meeting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/meetings/new-text">
                <Button variant="secondary" className="w-full">
                  Add meeting text
                  <FileText className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Recent meetings
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {recentMeetings.length > 0 ? `Showing ${recentMeetings.length} most recent` : 'No meetings yet'}
              </p>
            </div>

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

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-2 border-[#26b1b3] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">Loading meetings...</p>
            </div>
          ) : recentMeetings.length > 0 ? (
            <div className="space-y-3">
              {recentMeetings.map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/meetings/${meeting.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--bg-subtle)] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-[#26b1b3]/10 flex items-center justify-center">
                      <Video className="h-5 w-5 text-[#26b1b3]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[var(--color-text)] group-hover:text-[#26b1b3] transition-colors">
                        {meeting.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {meeting.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatRelativeDate(meeting.created_at)}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[#26b1b3] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[var(--color-border)] rounded-xl p-10 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-[var(--color-text-muted)]" />
                </div>

                <div className="space-y-1">
                  <p className="text-base font-semibold text-[var(--color-text)]">
                    No meetings yet
                  </p>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-md">
                    Upload your first recording or add meeting text to get started.
                    We'll extract speakers, buying signals, hesitation, deal probability, and next actions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Link to="/meetings/new">
                    <Button size="sm" className="bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent">
                      Upload your first meeting
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/meetings/new-text">
                    <Button size="sm" variant="secondary">
                      Add meeting text
                      <FileText className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">
              Quick actions
            </h3>

            <div className="space-y-2">
              <Link
                to="/meetings/new"
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--bg-subtle)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#26b1b3]/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-[#26b1b3]" />
                  </div>
                  <span className="text-base font-medium text-[var(--color-text)]">
                    Upload a meeting
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors" />
              </Link>

              <Link
                to="/meetings/new-text"
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--bg-subtle)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-base font-medium text-[var(--color-text)]">
                    Add meeting text
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors" />
              </Link>

              <Link
                to="/meetings"
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--bg-subtle)] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-base font-medium text-[var(--color-text)]">
                    View all meetings
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-colors" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">
              Your statistics
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--color-text-muted)]">Total meetings</span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {loading ? '...' : totalMeetings}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-muted)]">This week</span>
                <span className="text-base font-semibold text-blue-600">
                  {loading ? '...' : meetingsLast7Days}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-muted)]">Total tasks</span>
                <span className="text-base font-semibold text-[var(--color-text)]">
                  {loading ? '...' : totalTasks}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-muted)]">Tasks completed</span>
                <span className="text-base font-semibold text-emerald-600">
                  {loading ? '...' : doneTasks}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-[var(--color-border)]">
                <span className="text-sm text-[var(--color-text-muted)]">Tasks pending</span>
                <span className="text-base font-semibold text-amber-600">
                  {loading ? '...' : todoTasks + doingTasks}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              Everything you need to operationalize meetings
            </h2>
            <p className="max-w-2xl text-base text-[var(--color-text-muted)]">
              Upload meetings, extract structured intelligence, and take action faster — all in one clean workspace.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {ICON_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--bg-surface)] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center rounded-xl mb-5">
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="h-20 w-20 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--color-text)] text-center mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)] text-center">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5">
                  <Link to={card.href}>
                    <div className="w-full rounded-lg bg-white border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[#26b1b3] hover:text-white hover:border-[#26b1b3] transition-all duration-300 text-center">
                      {card.cta}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {recentMeetings.length > 0 && (
          <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  Recent activity
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Your latest meeting activities
                </p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-[var(--color-border)]">
              {recentMeetings.slice(0, 3).map((meeting) => (
                <Link
                  key={meeting.id}
                  to={`/meetings/${meeting.id}`}
                  className="py-3 flex items-center justify-between hover:bg-[var(--bg-subtle)] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm text-[var(--color-text)]">
                      Meeting analyzed: "{meeting.title}"
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatRelativeDate(meeting.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

const ICON_CARDS = [
  {
    icon: '/img/icons/icon1.png',
    title: 'Smart Meeting Upload',
    description:
      'Upload a meeting recording in seconds and keep everything organized by company.',
    cta: 'Upload a Meeting',
    href: '/meetings/new',
  },
  {
    icon: '/img/icons/icon2.png',
    title: 'AI Call Intelligence',
    description:
      'Extract buying signals, objections, and key commitments with speaker-aware timestamps for fast review.',
    cta: 'See Insights',
    href: '/meetings',
  },
  {
    icon: '/img/icons/icon3.png',
    title: 'Team-Ready Workspace',
    description:
      'Turn transcripts into actions: follow-up email drafts, recommended next steps, and confidence scoring.',
    cta: 'Explore Dashboard',
    href: '/dashboard',
  },
] as const
