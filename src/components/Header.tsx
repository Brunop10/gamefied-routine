import Spinner from './Spinner'

type Props = {
  title: string
  subtitle?: string
  user?: { name?: string | null; email?: string; picture?: string | null }
  onLogout?: () => void
  logoutLoading?: boolean
}

export default function Header({ title, subtitle, user, onLogout, logoutLoading }: Props) {
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

        {user ? (
          <div style={styles.userArea}>
            {user.picture ? (
              <img src={user.picture} alt={user.name || user.email} style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
            )}
            <div style={styles.userText}>
              <div style={styles.userName}>{user.name || user.email}</div>
            </div>
            {onLogout ? (
              <button
                style={styles.logout}
                onClick={onLogout}
                disabled={logoutLoading}
                aria-busy={logoutLoading}
              >
                {logoutLoading ? <Spinner size={16} color="#e2e8f0" /> : 'Sair'}
              </button>
            ) : null}
          </div>
        ) : null}
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
  userArea: {
    position: 'absolute',
    right: 12,
    top: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#334155',
    display: 'grid',
    placeItems: 'center',
    color: '#e2e8f0',
    fontWeight: 700,
  },
  userText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    color: '#cbd5e1',
    fontSize: 12,
  },
  userName: {
    fontWeight: 600,
    color: '#e2e8f0',
  },
  logout: {
    marginLeft: 8,
    background: 'transparent',
    border: '1px solid rgba(203,213,225,0.12)',
    color: '#e2e8f0',
    padding: '6px 8px',
    borderRadius: 8,
    cursor: 'pointer',
  },
}

