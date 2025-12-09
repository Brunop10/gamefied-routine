type NavKey = string

export type NavItem = {
  key: NavKey
  label: string
  icon: string
}

type Props = {
  items: NavItem[]
  active: NavKey
  onSelect: (key: NavKey) => void
}

export default function Navbar({ items, active, onSelect }: Props) {
  return (
    <nav style={styles.navbar} aria-label="Navegação principal">
      {items.map((item) => {
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            style={{
              ...styles.navButton,
              ...(isActive ? styles.navButtonActive : {}),
            }}
          >
            <span aria-hidden style={styles.icon}>
              {item.icon}
            </span>
            <span style={styles.label}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid #1f2937',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'stretch',
  },
  navButton: {
    background: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    cursor: 'pointer',
    transition: 'color 0.2s ease, transform 0.15s ease',
  },
  navButtonActive: {
    color: '#22d3ee',
    transform: 'translateY(-2px)',
  },
  icon: {
    fontSize: 18,
    lineHeight: 1,
  },
  label: {
    lineHeight: 1,
  },
}

