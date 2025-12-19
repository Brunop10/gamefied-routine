import { useState } from 'react'

export default function SchedulePage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  
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
    
    // Adicionar dias vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>)
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      
      days.push(
        <div 
          key={day} 
          style={{
            ...styles.day,
            ...(isToday ? styles.today : {}),
            ...(hoveredDay === day ? styles.dayHover : {})
          }}
          onMouseEnter={() => setHoveredDay(day)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          {day}
        </div>
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
}

