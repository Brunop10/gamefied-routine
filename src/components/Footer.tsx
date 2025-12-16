export default function SimpleFooter() {
  return (
    <footer style={styles.footer}>
      <div style={styles.content}/>
    </footer>
  )
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid #1f2937',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    zIndex: 10,
  },
  content: {
    width: '100%',
    textAlign: 'center',
  },
  text: {
    margin: 0,
    fontSize: 12,
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
}
