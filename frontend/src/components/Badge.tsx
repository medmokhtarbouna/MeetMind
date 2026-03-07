import type { HTMLAttributes } from 'react'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const toneClassMap: Record<BadgeTone, string> = {
  neutral:
    'bg-gray-100 text-gray-700 border border-gray-200',
  success:
    'bg-emerald-50 text-emerald-700 border border-emerald-100',
  warning:
    'bg-amber-50 text-amber-800 border border-amber-100',
  danger:
    'bg-rose-50 text-rose-700 border border-rose-100',
  info:
    'bg-blue-50 text-blue-700 border border-blue-100',
}

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClassMap[tone]} ${className}`}
      {...props}
    />
  )
}

