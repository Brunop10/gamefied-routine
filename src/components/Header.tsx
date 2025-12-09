type Props = {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: Props) {
  return (
    <header style={styles.header}>
      <div style={styles.content}>
        <div style={styles.brandCircle} aria-hidden>
          🌀
        </div>
        <div style={styles.titles}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #1f2937',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 10,
  },
  content: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center',
  },
  brandCircle: {
    position: 'absolute',
    left: 0,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
    display: 'grid',
    placeItems: 'center',
    fontSize: 18,
    color: '#0f172a',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  titles: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    margin: 0,
    color: '#cbd5e1',
    fontSize: '14px',
  },
}

