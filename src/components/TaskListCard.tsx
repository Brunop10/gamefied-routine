import { type Task } from '../tasks/api'
import Spinner from './Spinner'

type Props = {
  tasks: Task[]
  loading?: boolean
  title?: string
  description?: string
  limit?: number
  emptyText?: string
  actioningId?: number | null
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onToggleStatus?: (task: Task) => void
  renderActions?: (task: Task) => React.ReactNode
}

export default function TaskListCard({
  tasks,
  loading = false,
  title = 'Próximas tarefas',
  description = 'Últimas criadas / concluídas recentemente.',
  limit = 5,
  emptyText = 'Nenhuma tarefa encontrada.',
  actioningId = null,
  onEdit,
  onDelete,
  onToggleStatus,
  renderActions,
}: Props) {
  const items = tasks.slice(0, limit)
  const hasActions = Boolean(onEdit || onDelete || onToggleStatus || renderActions)

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.text}>{description}</p>
      </div>

      {loading ? (
        <div style={{ ...styles.textFaded, display: 'flex', justifyContent: 'center' }}>
          <Spinner size={28} color="#38bdf8" label="Carregando tarefas..." />
        </div>
      ) : items.length === 0 ? (
        <p style={styles.textFaded}>{emptyText}</p>
      ) : (
        <ul style={styles.list}>
          {items.map((task) => (
            <li key={task.id} style={styles.listItem}>
              <div style={styles.taskContent}>
                <div
                  style={{
                    ...styles.statusIndicator,
                    backgroundColor: task.status === 'feita' ? '#22c55e' : '#fb923c',
                  }}
                />
                <div>
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div style={styles.muted}>
                    {new Date(task.created_at).toLocaleString()} • {task.status === 'feita' ? 'Concluída' : 'Pendente'}
                  </div>
                </div>
              </div>
              {hasActions ? (
                <div style={styles.actions}>
                  {renderActions ? (
                    renderActions(task)
                  ) : (
                    <>
                      {onToggleStatus ? (
                        <button
                          type='button'
                          style={{
                            ...styles.actionButton,
                            backgroundColor: task.status === 'feita' ? '#fb923c' : '#22c55e',
                            color: '#0b1220',
                            border: 'none',
                            fontWeight: 600,
                          }}
                          onClick={() => onToggleStatus(task)}
                          disabled={actioningId === task.id}
                          title={task.status === 'feita' ? 'Marcar como pendente' : 'Marcar como feita'}
                        >
                          {task.status === 'feita' ? '↩️' : '✓'}
                        </button>
                      ) : null}
                      {onEdit ? (
                        <button
                          type='button'
                          style={styles.actionButton}
                          onClick={() => onEdit(task)}
                          disabled={actioningId === task.id}
                        >
                          ✏️
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type='button'
                          style={{ ...styles.actionButton, color: '#f87171' }}
                          onClick={() => onDelete(task)}
                          disabled={actioningId === task.id}
                        >
                          ❌
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              ) : (
                <span style={styles.muted}>
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 16,
    border: '1px solid #1e293b',
    background: 'linear-gradient(180deg, #0d1626 0%, #0a1020 100%)',
    padding: 16,
    minHeight: 140,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    margin: '0 0 2px',
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0',
  },
  text: {
    margin: 0,
    color: '#cbd5e1',
    fontSize: 14,
  },
  textFaded: {
    margin: 0,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #1f2937',
    background: '#0b1220',
    color: '#e2e8f0',
    fontSize: 14,
  },
  taskContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: '999px',
    flexShrink: 0,
  },
  taskTitle: {
    fontWeight: 600,
  },
  muted: {
    color: '#94a3b8',
    fontSize: 12,
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    background: 'transparent',
    border: '1px solid #1f2937',
    borderRadius: 8,
    color: '#e2e8f0',
    padding: '6px 10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
}

