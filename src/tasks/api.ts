export type TaskInput = { title: string }
export type Task = { id: number; title: string; created_at: string }
export type TaskUpdateInput = { id: number; title: string }

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const body = await res.json()
  if (!res.ok || body?.ok === false) {
    const err = body?.error || `HTTP ${res.status}`
    throw new Error(err)
  }
  return body as T
}

export async function addTask(input: TaskInput): Promise<Task> {
  const payload = { title: input.title.trim() }
  if (!payload.title) throw new Error('Título é obrigatório')

  const data = await request<{ ok: boolean; item: Task }>('/api/routines', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.item
}

export async function listTasks(): Promise<Task[]> {
  const data = await request<{ ok: boolean; items: Task[] }>('/api/routines')
  return data.items ?? []
}

export async function updateTask(input: TaskUpdateInput): Promise<Task> {
  const payload = { id: input.id, title: input.title.trim() }
  if (!payload.id || !payload.title) throw new Error('Id e título são obrigatórios')

  const data = await request<{ ok: boolean; item: Task }>('/api/routines', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data.item
}

export async function deleteTask(id: number): Promise<number> {
  if (!id) throw new Error('Id é obrigatório')

  const data = await request<{ ok: boolean; deleted_id: number }>('/api/routines', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  })
  return data.deleted_id
}

