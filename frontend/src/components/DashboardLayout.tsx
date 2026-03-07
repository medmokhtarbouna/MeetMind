import { useState, useRef, useEffect, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Video,
  Lightbulb,
  Settings,
  Bell,
  User,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface DashboardLayoutProps {
  title: string
  children: ReactNode
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  
  const userEmail = user?.email || ''
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0] || 'User'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex min-h-screen bg-[var(--bg-body)] text-[var(--color-text)]">
      <aside className="hidden w-64 flex-col bg-[#f9fbfc] md:flex fixed left-0 top-0 bottom-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="px-4 py-5">
            <Link to="/" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
              <img 
                src="/img/logo.png" 
                alt="MeetMind" 
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <div className="text-base font-semibold tracking-wide text-[#5b5b5b]">
                  MeetMind
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                Meeting Intelligence AI

                </div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 flex flex-col gap-1 text-base px-4 py-4">
            <SidebarItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <SidebarItem to="/meetings" label="Meetings" icon={Video} />
            <SidebarItem to="/insights" label="Insights" icon={Lightbulb} disabled />
            <SidebarItem to="/reports" label="Reports" icon={FileText} disabled />
            <SidebarItem to="/settings" label="Settings" icon={Settings} disabled />
          </nav>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium truncate">{userName}</span>
                <span className="text-xs text-[var(--color-text-muted)] truncate">
                  {userEmail}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--bg-surface)] px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setProfileOpen(false)
                }}
                className="relative h-9 w-9 rounded-full border border-[var(--color-border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] transition-colors flex items-center justify-center"
              >
                <Bell className="h-4 w-4 text-[var(--color-text)]" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-lg z-50">
                  <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[var(--color-text)]">Notifications</h3>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="h-6 w-6 rounded-full hover:bg-[var(--bg-subtle)] flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4 text-[var(--color-text-muted)]" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {NOTIFICATIONS.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                        <p className="text-sm text-[var(--color-text-muted)]">No notifications</p>
                      </div>
                    ) : (
                      NOTIFICATIONS.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-[var(--color-border)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.type === 'success' ? 'bg-emerald-50' :
                              notification.type === 'warning' ? 'bg-amber-50' :
                              'bg-blue-50'
                            }`}>
                              {notification.type === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : notification.type === 'warning' ? (
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Info className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--color-text)]">
                                {notification.title}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                {notification.message}
                              </p>
                              <span className="text-xs text-[var(--color-text-muted)] mt-1 block">
                                {notification.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {NOTIFICATIONS.length > 0 && (
                    <div className="p-3 border-t border-[var(--color-border)]">
                      <button className="w-full text-sm text-[#26b1b3] hover:text-[#26b1b3]/80 font-medium transition-colors">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationsOpen(false)
                }}
                className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <User className="h-4 w-4 text-white" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] shadow-lg z-50">
                  <div className="p-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={async () => {
                        setProfileOpen(false)
                        await signOut()
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--color-text)] hover:bg-[var(--bg-subtle)] transition-colors mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-6 py-5 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

const NOTIFICATIONS = [] as const

interface SidebarItemProps {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

function SidebarItem({ to, label, icon: Icon, disabled }: SidebarItemProps) {
  if (disabled) {
    return (
      <div className="flex items-center justify-between px-2 py-1.5 rounded-[10px] text-[var(--color-text-muted)] text-base cursor-not-allowed opacity-60">
        <div className="flex items-center gap-2.5">
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </div>
        <span className="text-xs border border-[var(--color-border)] rounded-full px-1.5 py-0.5">
          Soon
        </span>
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-2 py-1.5 rounded-[10px] text-base transition-colors ${
          isActive
            ? 'bg-[#26b1b3] text-white'
            : ' hover:bg-[#26b1b3]/10 hover:text-[#26b1b3]'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  )
}
