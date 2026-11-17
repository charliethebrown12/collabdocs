export type User = {
  id: string
  display_name: string
}

export type Access = 'owner' | 'write' | 'read'

export type DocumentSummary = {
  id: string
  owner_id: string
  title: string
  created_at: string
  updated_at: string
  access: Access
}

export type Document = DocumentSummary & {
  content_json: unknown
}

export type Share = {
  id: string
  document_id: string
  user_id: string
  permission: 'read' | 'write'
  display_name: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { userId?: string | null } = {},
): Promise<T> {
  const { userId, ...init } = options
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (userId) {
    headers.set('X-Demo-User-Id', userId)
  }

  const res = await fetch(path, { ...init, headers })
  if (res.status === 204) {
    return undefined as T
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data.error || res.statusText || 'Request failed')
  }
  return data as T
}

export const api = {
  listUsers: () => request<{ users: User[] }>('/api/users'),

  listDocuments: (userId: string) =>
    request<{ owned: DocumentSummary[]; shared: DocumentSummary[] }>(
      '/api/documents',
      { userId },
    ),

  getDocument: (userId: string, id: string) =>
    request<{ document: Document; access: Access }>(`/api/documents/${id}`, {
      userId,
    }),

  createDocument: (
    userId: string,
    payload: { title: string; content_json?: unknown },
  ) =>
    request<{ document: Document; access: Access }>('/api/documents', {
      method: 'POST',
      userId,
      body: JSON.stringify(payload),
    }),

  updateDocument: (
    userId: string,
    id: string,
    payload: { title?: string; content_json?: unknown },
  ) =>
    request<{ document: Document; access: Access }>(`/api/documents/${id}`, {
      method: 'PATCH',
      userId,
      body: JSON.stringify(payload),
    }),

  listShares: (userId: string, id: string) =>
    request<{ shares: Share[] }>(`/api/documents/${id}/shares`, { userId }),

  createShare: (
    userId: string,
    id: string,
    payload: { user_id: string; permission: 'read' | 'write' },
  ) =>
    request<{ share: Share }>(`/api/documents/${id}/shares`, {
      method: 'POST',
      userId,
      body: JSON.stringify(payload),
    }),

  revokeShare: (userId: string, id: string, shareId: string) =>
    request<void>(`/api/documents/${id}/shares/${shareId}`, {
      method: 'DELETE',
      userId,
    }),
}
