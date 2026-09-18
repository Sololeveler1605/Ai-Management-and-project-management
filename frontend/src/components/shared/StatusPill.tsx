import type { ReactNode } from 'react'

type StatusPillProps = {
  text: ReactNode
  color: string
  className?: string
}

/** Admin status pill — bg color+1A, border color+55, text color */
export function StatusPill({ text, color, className = '' }: StatusPillProps) {
  return (
    <span
      className={`status-pill ${className}`.trim()}
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: '0.75rem',
        fontWeight: 600,
        background: `${color}1A`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {text}
    </span>
  )
}
