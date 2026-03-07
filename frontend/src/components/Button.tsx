import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  leftIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  leftIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap border font-medium transition-colors rounded-[999px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const variants: Record<Variant, string> = {
    primary:
      'bg-[var(--color-primary)] text-white border-transparent hover:bg-[var(--color-primary-soft)] disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary:
      'bg-[var(--bg-surface)] text-[#555] border-[#d4d4d4] hover:bg-[#f9fafb] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-[var(--color-text)] border-transparent hover:bg-[var(--bg-subtle)] disabled:text-gray-400 disabled:cursor-not-allowed',
  }

  const sizes: Record<Size, string> = {
    sm: 'text-sm px-3.5 py-1.5 gap-1.5',
    md: 'text-base px-4.5 py-2.5 gap-2',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex">{leftIcon}</span>}
      {props.children}
    </button>
  )
}

