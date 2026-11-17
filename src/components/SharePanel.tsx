import { useEffect, useState } from 'react'
import { api, type Share, type User } from '../api/client'

type Props = {
  documentId: string
  currentUserId: string
  users: User[]
  onShared?: () => void
}

export function SharePanel({
  documentId,
  currentUserId,
  users,
  onShared,
}: Props) {
  const [shares, setShares] = useState<Share[]>([])
  const [userId, setUserId] = useState('')
  const [permission, setPermission] = useState<'read' | 'write'>('write')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const others = users.filter((u) => u.id !== currentUserId)

  const load = async () => {
    try {
      const { shares: list } = await api.listShares(currentUserId, documentId)
      setShares(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shares')
    }
  }

  useEffect(() => {
    void load()
  }, [documentId, currentUserId])

  useEffect(() => {
    if (!userId && others[0]) setUserId(others[0].id)
  }, [others, userId])

  const share = async () => {
    if (!userId) return
    setBusy(true)
    setError(null)
    try {
      await api.createShare(currentUserId, documentId, {
        user_id: userId,
        permission,
      })
      await load()
      onShared?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Share failed')
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (shareId: string) => {
    setBusy(true)
    setError(null)
    try {
      await api.revokeShare(currentUserId, documentId, shareId)
      await load()
      onShared?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="share-panel">
      <h2>Sharing</h2>
      <p className="muted">
        Grant another demo user access. Server enforces owner-only sharing.
      </p>

      <div className="share-form">
        <label>
          User
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            disabled={busy || others.length === 0}
          >
            {others.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Permission
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as 'read' | 'write')}
            disabled={busy}
          >
            <option value="write">Can edit</option>
            <option value="read">Can view</option>
          </select>
        </label>
        <button type="button" onClick={() => void share()} disabled={busy || !userId}>
          Share
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <ul className="share-list">
        {shares.length === 0 && <li className="muted">Not shared with anyone yet.</li>}
        {shares.map((s) => (
          <li key={s.id}>
            <span>
              {s.display_name} — {s.permission}
            </span>
            <button type="button" onClick={() => void revoke(s.id)} disabled={busy}>
              Revoke
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
