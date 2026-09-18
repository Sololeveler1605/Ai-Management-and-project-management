import type { CSSProperties, ReactNode } from 'react'

type IconBadgeProps = {
  icon: ReactNode
  bg: string
  fg?: string
  /** admin = 44px/12px radius; client = 48px/14px radius */
  size?: 'admin' | 'client'
  className?: string
  style?: CSSProperties
}

export function IconBadge({
  icon,
  bg,
  fg = '#111827',
  size = 'admin',
  className = '',
  style,
}: IconBadgeProps) {
  const isClient = size === 'client'
  return (
    <div
      className={`icon-badge ${className}`.trim()}
      style={{
        width: isClient ? 48 : 44,
        height: isClient ? 48 : 44,
        borderRadius: isClient ? 14 : 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isClient ? '1.4rem' : '1.25rem',
        marginBottom: isClient ? undefined : '0.5rem',
        boxShadow: isClient
          ? 'inset 0 1px 2px rgba(255,255,255,0.6), 0 2px 4px rgba(17,24,39,0.06)'
          : undefined,
        ...style,
      }}
    >
      <span style={{ color: fg }}>{icon}</span>
    </div>
  )
}
