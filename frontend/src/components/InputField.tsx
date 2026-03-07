import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
  icon?: ReactNode
}

export function InputField({
  label,
  description,
  error,
  icon,
  id,
  className = '',
  ...props
}: InputFieldProps) {
  const inputId = id ?? props.name

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-[var(--color-text)]"
      >
        {label}
      </label>
      {description && (
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      )}
      <div
        className={`flex items-center gap-2 rounded-[10px] border px-3.5 py-2.5 bg-[var(--bg-surface)] transition-shadow ${
          error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
        } focus-within:shadow-[0_0_0_1px_rgba(37,99,235,0.25)]`}
      >
        {icon && <span className="text-gray-400 text-sm">{icon}</span>}
        <input
          id={inputId}
          className="flex-1 border-0 bg-transparent text-base outline-none placeholder:text-[var(--color-text-muted)]"
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  )
}

