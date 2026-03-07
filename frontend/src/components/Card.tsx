import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean
}

export function Card({ className = '', muted, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[12px] border border-[var(--color-border)] bg-${
        muted ? '[var(--bg-subtle)]' : '[var(--bg-surface)]'
      } shadow-[var(--shadow-sm)] ${className}`}
      {...props}
    />
  )
}

