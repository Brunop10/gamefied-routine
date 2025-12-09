import { useEffect, useState } from 'react'
import { addTask, listTasks, type Task } from '../tasks/api'
import Modal from '../components/Modal'
import TaskListCard from '../components/TaskListCard'

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const openModal = () => {
    setMessage(null)
    setTitle('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setMessage(null)
    setTitle('')
  }

  useEffect(() => {
    void refreshTasks()
  }, [])

  const refreshTasks = async () => {
    setListLoading(true)
    try {
      const items = await listTasks()
      setTasks(items)
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || 'Erro ao carregar tarefas.' })
    } finally {
      setListLoading(false)
    }
  }

  const handleAdd = async () => {
    const name = title.trim()
    if (!name) return
    setLoading(true)
    setMessage(null)
    try {
      await addTask({ title: name })
      setTitle('')
      setMessage({ type: 'ok', text: 'Tarefa criada com sucesso.' })
      void refreshTasks()
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message || 'Erro ao criar tarefa.' })
    } finally {
      setLoading(false)
    }
    closeModal()
  }

  return (
    <div style={styles.wrapper}>
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.title}>Adicionar tarefa rápida</h2>
          <p style={styles.text}>Crie uma nova tarefa direto daqui.</p>
        </div>

        <button
          type="button"
          style={styles.button}
          onClick={openModal}
          disabled={loading}
        >
          + Nova tarefa
        </button>
      </section>

      <TaskListCard tasks={tasks} loading={listLoading} />

      <Modal open={showModal} title="Nova tarefa" onClose={closeModal}>
        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Ex.: Treino, Estudar, Ler 20 páginas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="button"
            style={styles.button}
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
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
      </Modal>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    borderRadius: 16,
    border: '1px solid #1e293b',
    background: 'linear-gradient(180deg, #111827 0%, #0b1220 100%)',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    margin: '0 0 6px',
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
  button: {
    background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
    color: '#0f172a',
    border: 'none',
    borderRadius: 12,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(99,102,241,0.35)',
    minWidth: 130,
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #1f2937',
    background: '#0b1220',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
  },
  feedback: {
    margin: 0,
    fontSize: 13,
  },
}

