import type { ReactNode } from 'react'

export interface TabConfig {
  id: string
  label: string
}

interface TabsProps {
  tabs: TabConfig[]
  activeId: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div className="border-b border-[var(--color-border)] flex gap-2 text-sm">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            className={`relative px-3 pb-2 pt-2 border-b-2 -mb-px ${
              isActive
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-medium'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

interface TabPanelProps {
  whenActive: string
  activeId: string
  children: ReactNode
}

export function TabPanel({ whenActive, activeId, children }: TabPanelProps) {
  if (whenActive !== activeId) return null
  return <div className="pt-4">{children}</div>
}

