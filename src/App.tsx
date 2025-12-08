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
              <li key={r.id}>{r.title} — {new Date(r.created_at).toLocaleString()}</li>
            ))}
          </ul>
        )}
      </div>
   </>
  )
}

export default App
