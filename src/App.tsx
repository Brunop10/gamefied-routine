import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function App() {
  const [routines, setRoutines] = useState<Array<{id:number,title:string,created_at:string}>>([])
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/routines`)
      .then((r) => r.json())
      .then((j) => setRoutines(j?.items ?? []))
      .catch(() => setRoutines([]))
  }, [])

  return (
    <>
      <div>
        <h2>Rotinas</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Nova rotina"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            onClick={async () => {
              const title = newTitle.trim()
              if (!title) return
              setNewTitle('')
              const res = await fetch(`${API_BASE}/api/routines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
              })
              const j = await res.json()
              if (j?.ok && j.item) {
                setRoutines((prev) => [j.item, ...prev])
              }
            }}
          >
            Adicionar
          </button>
        </div>
        {routines.length === 0 ? (
          <p>Nenhuma rotina cadastrada</p>
        ) : (
          <ul>
            {routines.map((r) => (
              <li key={r.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{r.title} — {new Date(r.created_at).toLocaleString()}</span>
                <button
                  onClick={async () => {
                    const next = window.prompt('Novo título', r.title)?.trim()
                    if (!next) return
                    const res = await fetch(`${API_BASE}/api/routines`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: r.id, title: next }),
                    })
                    const j = await res.json()
                    if (j?.ok && j.item) {
                      setRoutines((prev) => prev.map((x) => x.id === r.id ? j.item : x))
                    }
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Excluir esta rotina?')) return
                    const res = await fetch(`${API_BASE}/api/routines`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: r.id }),
                    })
                    const j = await res.json()
                    if (j?.ok) {
                      setRoutines((prev) => prev.filter((x) => x.id !== r.id))
                    }
                  }}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
   </>
  )
}

export default App
