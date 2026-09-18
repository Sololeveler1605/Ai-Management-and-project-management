import { initials } from '../../lib/helpers'

type InitialsAvatarProps = {
  name: string
  size?: number
  className?: string
}

/** Violet badge style matching Streamlit `st.badge(..., color="violet")` */
export function InitialsAvatar({ name, size = 40, className = '' }: InitialsAvatarProps) {
  const letters = initials(name)
  return (
    <div
      className={className}
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EDE9FE',
        color: '#5B21B6',
        border: '1px solid #C4B5FD',
        fontWeight: 700,
        fontSize: Math.max(11, Math.round(size * 0.36)),
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
    >
      {letters}
    </div>
  )
}
