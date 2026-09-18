import type { CSSProperties, ReactNode } from 'react'
import { IconBadge } from './IconBadge'

type StatCardProps = {
  icon: ReactNode
  bg: string
  label: string
  value: ReactNode
  caption?: ReactNode
  className?: string
  style?: CSSProperties
  variant?: 'admin' | 'client'
}

export function StatCard({
  icon,
  bg,
  label,
  value,
  caption,
  className = '',
  style,
  variant = 'admin',
}: StatCardProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #EEF0F3',
        borderRadius: variant === 'client' ? 18 : 14,
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
        padding: '1rem',
        ...style,
      }}
    >
      <IconBadge icon={icon} bg={bg} size={variant === 'client' ? 'client' : 'admin'} />
      <div style={{ color: '#6B7280', fontSize: '0.82rem' }}>{label}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>{value}</div>
      {caption != null && (
        <div style={{ color: '#4B5563', fontSize: '0.82rem', marginTop: 4, fontWeight: 500 }}>
          {caption}
        </div>
      )}
    </div>
  )
}
