import { useEffect, useState } from 'react'
import { deleteTask, listTasks, updateTask, type Task } from '../tasks/api'
import TaskListCard from '../components/TaskListCard'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  useEffect(() => {
    void refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await listTasks()
      setTasks(data)
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || 'Erro ao carregar tarefas.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (task: Task) => {
    const next = window.prompt('Novo título', task.title)?.trim()
    if (!next) return
    setActionId(task.id)
    setMessage(null)
    try {
      const updated = await updateTask({ id: task.id, title: next })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      setMessage({ type: 'ok', text: 'Tarefa atualizada.' })
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || 'Erro ao atualizar.' })
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (task: Task) => {
    if (!window.confirm('Remover esta tarefa?')) return
    setActionId(task.id)
    setMessage(null)
    try {
      await deleteTask(task.id)
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      setMessage({ type: 'ok', text: 'Tarefa removida.' })
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || 'Erro ao remover.' })
    } finally {
      setActionId(null)
    }
  }

  return (
    <div style={styles.wrapper}>
      {message ? (
        <p
          style={{
            ...styles.feedback,
            color: message.type === 'ok' ? '#34d399' : '#f87171',
          }}
        >
          {message.text}
        </p>
      ) : null}

      <TaskListCard
        tasks={tasks}
        loading={loading}
        title='Minhas tarefas'
        description='Editar ou remover diretamente.'
        limit={9999}
        actioningId={actionId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyText='Nenhuma tarefa encontrada.'
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  feedback: {
    margin: 0,
    fontSize: 13,
  },
}

