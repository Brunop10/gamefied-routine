type Props = {
  children: React.ReactNode
}

export default function Screen({ children }: Props) {
  return <main style={styles.main}>{children}</main>
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    padding: '12px 16px',
  },
}

