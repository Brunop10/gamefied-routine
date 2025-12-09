type Props = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, title, onClose, children }: Props) {
  if (!open) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.close} onClick={onClose} aria-label="Fechar modal">
            ✕
          </button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    border: '1px solid #1e293b',
    background: '#0b1220',
    padding: 16,
    boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: 700,
  },
  close: {
    background: 'transparent',
    border: 'none',
    color: '#e2e8f0',
    fontSize: 18,
    cursor: 'pointer',
    lineHeight: 1,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
}

