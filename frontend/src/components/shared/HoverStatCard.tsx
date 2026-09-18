import type { CSSProperties, ReactNode } from 'react'
import { useState } from 'react'
import { IconBadge } from './IconBadge'

type HoverStatCardProps = {
  icon: ReactNode
  bg: string
  label: string
  value: ReactNode
  caption?: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
}

export function HoverStatCard({
  icon,
  bg,
  label,
  value,
  caption,
  className = '',
  style,
  onClick,
}: HoverStatCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? '#F5F3FF' : '#FFFFFF',
        border: hovered ? '1.5px solid #818CF8' : '1.5px solid #D8DCE5',
        borderRadius: 14,
        boxShadow: hovered
          ? '0 12px 28px rgba(79,70,229,0.22)'
          : '0 2px 6px rgba(16,24,40,0.08)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition:
          'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background-color 0.15s ease',
        cursor: onClick ? 'pointer' : 'default',
        padding: '1rem',
        ...style,
      }}
    >
      <IconBadge icon={icon} bg={bg} size="admin" />
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
