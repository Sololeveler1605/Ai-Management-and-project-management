import type { CSSProperties, ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  /** admin = 14px; client = 18px — matching Streamlit bordered containers */
  variant?: 'admin' | 'client'
  className?: string
  style?: CSSProperties
  hoverLift?: boolean
}

export function Card({
  children,
  variant = 'admin',
  className = '',
  style,
  hoverLift = false,
}: CardProps) {
  const isClient = variant === 'client'
  return (
    <div
      className={`app-card ${hoverLift ? 'app-card--hover' : ''} ${className}`.trim()}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEF0F3',
        borderRadius: isClient ? 18 : 14,
        boxShadow: isClient
          ? '0 2px 8px rgba(17,24,39,0.06)'
          : '0 1px 2px rgba(16,24,40,0.04)',
        padding: '0.85rem 1rem',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
