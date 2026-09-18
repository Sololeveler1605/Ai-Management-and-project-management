import type { ReactNode } from 'react'
import { deadlinePill as deadlinePillHelper } from '../../lib/helpers'

export type PillVariant = 'pill-red' | 'pill-orange' | 'pill-green' | 'pill-blue' | 'pill-gray'

type PillProps = {
  children: ReactNode
  variant?: PillVariant | string
  className?: string
}

/** Client pills — exact hex via .pill-* classes from client.py CSS */
export function Pill({ children, variant = 'pill-gray', className = '' }: PillProps) {
  return <span className={`pill ${variant} ${className}`.trim()}>{children}</span>
}

export function DeadlinePill({ days }: { days: number | null }) {
  const [label, cls] = deadlinePillHelper(days)
  return <Pill variant={cls}>{label}</Pill>
}

export { deadlinePillHelper as deadlinePill }
