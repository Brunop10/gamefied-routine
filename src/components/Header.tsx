import { useEffect, useState } from 'react'
import Spinner from './Spinner'

type Props = {
  title: string
  user?: { name?: string | null; email?: string; picture?: string | null }
  onLogout?: () => void
  logoutLoading?: boolean
}

export default function Header({ title, user, onLogout, logoutLoading }: Props) {
  const [isMobile, setIsMobile] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => {
      setIsMobile(mq.matches)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <>
      <header style={styles.header}>
        <div style={styles.content}>
          <div style={styles.brandCircle} aria-hidden>
            🌀
          </div>
          <div style={styles.titles}>
            <h1 style={styles.title}>{title}</h1>
          </div>

          {user ? (
            <button
              type="button"
              style={{ ...styles.toggle, ...(isMobile ? styles.toggleMobile : null) }}
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
              aria-label={userOpen ? 'Ocultar informações da conta' : 'Mostrar informações da conta'}
            >
              <span style={styles.toggleIcon}>👤</span>
              {userOpen ? '▴' : '▾'}
            </button>
          ) : null}
        </div>
      </header>

      {user && userOpen ? (
        <div style={styles.subheader}>
          <div style={styles.subheaderInner}>
            <div style={styles.subLeft}>
              {user.picture ? (
                <img src={user.picture} alt={user.name || user.email} style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
              )}
              <div style={styles.userText}>
                <div style={styles.userName}>{user.name || user.email}</div>
                {user.email && user.email !== user.name ? (
                  <div style={styles.userEmail}>{user.email}</div>
                ) : null}
              </div>
            </div>
            {onLogout ? (
              <button
                style={styles.logout}
                onClick={onLogout}
                disabled={logoutLoading}
                aria-busy={logoutLoading}
              >
                {logoutLoading ? <Spinner size={16} color="#e2e8f0" label='Saindo...' /> : 'Sair'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
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
    gap: 12,
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
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  titles: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    width: '100%',
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
  toggle: {
    background: 'transparent',
    border: '1px solid rgba(203,213,225,0.25)',
    color: '#e2e8f0',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  toggleIcon: {
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
  },
  toggleMobile: {
    padding: '8px 10px',
  },
  subheader: {
    position: 'relative',
    top: 1,
    left: 0,
    right: 0,
    width: '100%',
    background: '#0b1220',
    borderBottom: '1px solid #1f2937',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    zIndex: 1,
  },
  subheaderInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    flexWrap: 'wrap',
  },
  subLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    flex: 1,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
  },
}

