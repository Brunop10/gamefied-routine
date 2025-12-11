import type { CSSProperties } from 'react'

export type SpinnerProps = {
  size?: number
  color?: string
}

export default function Spinner({ size = 48, color = '#38bdf8' }: SpinnerProps) {
  const style = {
    '--spinner-size': `${size}px`,
    '--spinner-color': color,
  } as CSSProperties

  return (
    <div className="spinner" style={style} role="status" aria-label="Carregando">
      <div className="spinner-ring" />
    </div>
  )
}
