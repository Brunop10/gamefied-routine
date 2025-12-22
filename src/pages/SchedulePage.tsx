import { useEffect, useMemo, useState } from 'react'
import { listTasks, type Task } from '../tasks/api'

export default function SchedulePage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    listTasks()
      .then(items => {
        if (!active) return
        setTasks(items)
        setError(null)
      })
      .catch(err => {
        if (!active) return
        setError(err.message || 'Erro ao buscar tarefas')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const dateKeyFromString = (iso: string) => {
    const parsed = new Date(iso)
    return formatDateKey(parsed)
  }

  const selectedDateKey = formatDateKey(selectedDate)

  const tasksByDay = useMemo(() => {
    return tasks.reduce<Record<string, number>>((acc, task) => {
      const key = dateKeyFromString(task.created_at)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }, [tasks])

  const tasksForSelectedDay = useMemo(() => {
    return tasks.filter(task => dateKeyFromString(task.created_at) === selectedDateKey)
  }, [selectedDateKey, tasks])

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setCurrentMonth(date.getMonth())
    setCurrentYear(date.getFullYear())
  }

  const formatHumanDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }
  
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }
  
  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }
  
  const renderMonth = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      
      const isSelected = formatDateKey(date) === selectedDateKey
      const tasksCount = tasksByDay[formatDateKey(date)] || 0

      days.push(
        <button
          key={day}
          style={{
            ...styles.day,
            ...(isToday ? styles.today : {}),
            ...(isSelected ? styles.selectedDay : {}),
            ...(hoveredDay === day ? styles.dayHover : {}),
          }}
          onMouseEnter={() => setHoveredDay(day)}
          onMouseLeave={() => setHoveredDay(null)}
          onClick={() => handleDayClick(date)}
        >
          <span>{day}</span>
          {tasksCount > 0 ? (
            <span style={styles.taskBadge}>{tasksCount}</span>
          ) : null}
        </button>
      )
    }
    
    return (
      <div style={styles.monthContainer}>
        <div style={styles.weekDaysContainer}>
          {weekDays.map(day => (
            <div key={day} style={styles.weekDay}>{day}</div>
          ))}
        </div>
        <div style={styles.daysGrid}>
          {days}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.navigation}>
          <button onClick={goToPreviousMonth} style={styles.navButton} aria-label="Mês anterior">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>{monthNames[currentMonth]} {currentYear}</h1>
            <button onClick={goToToday} style={styles.todayButton}>Hoje</button>
          </div>
          
          <button onClick={goToNextMonth} style={styles.navButton} aria-label="Próximo mês">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      {renderMonth()}
      <div style={styles.tasksPanel}>
        <div style={styles.tasksHeader}>
          <div>
            <p style={styles.tasksSubtitle}>Tarefas em</p>
            <h2 style={styles.tasksTitle}>{formatHumanDate(selectedDate)}</h2>
          </div>
          <span style={styles.tasksCount}>{tasksForSelectedDay.length} tarefas</span>
        </div>

        {loading ? (
          <div style={styles.loadingBox}>Carregando tarefas...</div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : tasksForSelectedDay.length === 0 ? (
          <div style={styles.emptyTasks}>Nenhuma tarefa para este dia.</div>
        ) : (
          <ul style={styles.taskList}>
            {tasksForSelectedDay.map(task => (
              <li key={task.id} style={styles.taskItem}>
                <div>
                  <p style={styles.taskTitle}>{task.title}</p>
                  <p style={styles.taskTime}>Criada em {formatHumanDate(new Date(task.created_at))}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '24px',
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  navButton: {
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#f1f5f9',
    cursor: 'pointer',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    minWidth: '48px',
    minHeight: '48px',
  },
  titleContainer: {
    flex: 1,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    color: '#f1f5f9',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  todayButton: {
    background: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    padding: '6px 16px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  monthContainer: {
    borderRadius: '12px',
    border: '1px solid #1e293b',
    background: 'linear-gradient(180deg, #111827 0%, #0b1220 100%)',
    padding: '24px',
  },
  weekDaysContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },
  weekDay: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    padding: '8px',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
  },
  day: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#cbd5e1',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent',
    background: 'transparent',
    width: '100%',
    outline: 'none',
    position: 'relative',
  },
  dayHover: {
    background: '#1e293b',
    border: '1px solid #334155',
  },
  emptyDay: {
    aspectRatio: '1',
  },
  today: {
    background: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDay: {
    border: '1px solid #3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.3)',
  },
  taskBadge: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    background: '#22c55e',
    color: '#0b1220',
    borderRadius: '999px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 700,
  },
  tasksPanel: {
    marginTop: '24px',
    marginBottom: '40px',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    background: 'linear-gradient(180deg, #0f172a 0%, #0b1220 100%)',
  },
  tasksHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '12px',
  },
  tasksSubtitle: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 500,
  },
  tasksTitle: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: '22px',
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  tasksCount: {
    background: '#1e293b',
    color: '#e2e8f0',
    borderRadius: '999px',
    padding: '8px 14px',
    fontSize: '14px',
    border: '1px solid #334155',
  },
  loadingBox: {
    padding: '12px 14px',
    color: '#cbd5e1',
    background: '#111827',
    borderRadius: '8px',
    border: '1px solid #1f2937',
  },
  errorBox: {
    padding: '12px 14px',
    color: '#fecdd3',
    background: '#1f172a',
    borderRadius: '8px',
    border: '1px solid #7f1d1d',
  },
  emptyTasks: {
    padding: '12px 14px',
    color: '#94a3b8',
    background: '#0b1220',
    borderRadius: '8px',
    border: '1px dashed #1e293b',
  },
  taskList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  taskItem: {
    padding: '12px 14px',
    background: '#111827',
    borderRadius: '10px',
    border: '1px solid #1f2937',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: '16px',
    fontWeight: 600,
  },
  taskTime: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '13px',
  },
}

