export default function AddPage() {
  return (
    <div style={styles.card}>
      <p style={styles.text}>
        (Área de criação rápida: nova tarefa ou entrada de diário)
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 16,
    border: '1px solid #1e293b',
    background: 'linear-gradient(180deg, #111827 0%, #0b1220 100%)',
    minHeight: 260,
    display: 'grid',
    placeItems: 'center',
  },
  text: {
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 1.4,
  },
}

