type ColorDotProps = {
  color: string
  size?: number
  className?: string
}

/** Small filled circle for legends — uses background-color (not text color). */
export function ColorDot({ color, size = 10, className = '' }: ColorDotProps) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        verticalAlign: 'middle',
      }}
    />
  )
}
