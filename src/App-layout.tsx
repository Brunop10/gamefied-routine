import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import SimpleFooter from './components/Footer.tsx'
import Navbar, { type NavItem } from './components/Navbar'
import Screen from './components/Screen'
import HomePage from './pages/HomePage'
import TasksPage from './pages/TasksPage'
import SchedulePage from './pages/SchedulePage.tsx'
import AchievementsPage from './pages/AchievementsPage'
import LoginPage from './pages/LoginPage'
import { getMe, logout, type User } from './auth/api'
import Spinner from './components/Spinner'

type Page = 'home' | 'tasks' | 'schedule' | 'achievements'

const NAV_ITEMS: Array<NavItem & { key: Page }> = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'tasks', label: 'Tarefas', icon: '🗒️' },
  { key: 'schedule', label: 'Calendário', icon: '📅' },
  { key: 'achievements', label: 'Conquistas', icon: '🏆' },
]

export default function AppLayout() {
  const [active, setActive] = useState<Page>('home')
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    void (async () => {
      const u = await getMe()
      setUser(u)
      setAuthLoading(false)
    })()
  }, [])

  async function handleLogout() {
    if (logoutLoading) return
    setLogoutLoading(true)
    try {
      await logout()
    } catch (e) {
      // ignore
    } finally {
      setUser(null)
      setActive('home')
      setLogoutLoading(false)
    }
  }

  const content = useMemo(() => {
    switch (active) {
      case 'home':
        return { title: 'Home' }
      case 'tasks':
        return { title: 'Tarefas' }
      case 'schedule':
        return { title: 'Calendário' }
      case 'achievements':
        return { title: 'Conquistas' }
      default:
        return { title: '' }
    }
  }, [active])

  const PageComponent = useMemo(() => {
    switch (active) {
      case 'home':
        return HomePage
      case 'tasks':
        return TasksPage
      case 'schedule':
        return SchedulePage
      case 'achievements':
        return AchievementsPage
      default:
        return TasksPage
    }
  }, [active])

  const showContent = authLoading ? (
    <>
      <Header title="Gamefied Routine" />
      <div style={styles.loading}>
        <Spinner label="Carregando sessão..." />
      </div>
      <SimpleFooter />
    </>
  ) : user ? (
    <>
      <Header
        title={content.title}
        user={user}
        onLogout={handleLogout}
        logoutLoading={logoutLoading}
      />
      <Screen>
        <PageComponent />
      </Screen>
      <Navbar items={NAV_ITEMS} active={active} onSelect={(key) => setActive(key as Page)} />
    </>
  ) : (
    <>
      <Header title="Gamefied Routine" />
      <Screen>
        <LoginPage />
      </Screen>
      <SimpleFooter />
    </>
  )

  return <div style={styles.shell}>{showContent}</div>
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 0, 
    paddingTop: 64, 
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#142e5770',
  },
}

