type Props = {
  children: React.ReactNode
}

export default function Screen({ children }: Props) {
  return <main style={styles.main}>{children}</main>
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    flex: 1,
    display: 'block',
    padding: '12px 16px',
    backgroundColor: '#142e5770',
  },
}

