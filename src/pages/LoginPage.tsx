import { startGoogleLogin } from '../auth/api'

export default function LoginPage() {
  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Entrar</h2>
      <p style={styles.text}>Faça login para ver e gerenciar suas tarefas.</p>
      <button style={styles.button} onClick={startGoogleLogin}>
        Continuar com Google
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginTop: 40,
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
    textAlign: 'center',
    color: '#e2e8f0',
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
  },
  text: {
    margin: 0,
    color: '#cbd5e1',
    maxWidth: 320,
  },
  button: {
    marginTop: 8,
    background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
    color: '#0f172a',
    border: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
    width: '100%',
    maxWidth: 280,
  },
}

