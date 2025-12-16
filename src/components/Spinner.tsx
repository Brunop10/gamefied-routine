import type { CSSProperties } from 'react'

export type SpinnerProps = {
  size?: number
  color?: string
  label?: string | null
}

export default function Spinner({ size = 48, color = '#38bdf8', label = 'Carregando...' }: SpinnerProps) {
  const styles: Record<string, CSSProperties> = {
    wrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      color: '#cbd5e1',
      fontSize: 14,
    },
    ring: {
      width: size,
      height: size,
      borderRadius: '50%',
      border: '4px solid rgba(148, 163, 184, 0.35)',
      borderTopColor: color,
      animation: 'spinner-rotate 0.9s linear infinite',
      boxSizing: 'border-box',
      flexShrink: 0,
    },
    label: {
      lineHeight: 1.3,
    },
  }

  return (
    <div style={styles.wrapper} role="status" aria-label={label ?? 'Carregando'}>
      <div style={styles.ring} />
      {label ? <span style={styles.label}>{label}</span> : null}
    </div>
  )
}
