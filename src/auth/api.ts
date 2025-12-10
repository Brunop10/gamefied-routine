export type User = { id: number; email: string; name?: string; picture?: string | null }

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
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

export async function getMe(): Promise<User | null> {
  try {
    const data = await request<{ ok: boolean; user: User }>('/api/me')
    return data.user
  } catch {
    return null
  }
}

export function startGoogleLogin() {
  window.location.href = `${API_BASE}/api/auth/google/start`
}

export async function logout(): Promise<void> {
  await request('/api/logout', { method: 'POST' })
}

