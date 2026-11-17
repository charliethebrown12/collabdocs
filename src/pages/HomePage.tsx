import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, type DocumentSummary } from '../api/client'
import { useDemoUser } from '../context/DemoUserContext'
import {
  importFileToDocument,
  SUPPORTED_IMPORT_TYPES,
} from '../lib/importFile'

export function HomePage() {
  const { currentUser } = useDemoUser()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [owned, setOwned] = useState<DocumentSummary[]>([])
  const [shared, setShared] = useState<DocumentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.listDocuments(userId)
      setOwned(data.owned)
      setShared(data.shared)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentUser) return
    void load(currentUser.id)
  }, [currentUser])

  const createDoc = async () => {
    if (!currentUser) return
    setBusy(true)
    setError(null)
    try {
      const { document } = await api.createDocument(currentUser.id, {
        title: 'Untitled',
      })
      navigate(`/documents/${document.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
      setBusy(false)
    }
  }

  const onImport = async (file: File | undefined) => {
    if (!file || !currentUser) return
    setBusy(true)
    setError(null)
    try {
      const imported = await importFileToDocument(file)
      const { document } = await api.createDocument(currentUser.id, imported)
      navigate(`/documents/${document.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setBusy(false)
    }
  }

  const renderList = (items: DocumentSummary[], empty: string) => {
    if (items.length === 0) return <p className="muted">{empty}</p>
    return (
      <ul className="doc-list">
        {items.map((doc) => (
          <li key={doc.id}>
            <Link to={`/documents/${doc.id}`}>
              <span className="doc-title">{doc.title}</span>
              <span className="doc-meta">
                {doc.access} · updated{' '}
                {new Date(doc.updated_at).toLocaleString()}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Documents</h1>
          <p className="muted">
            Create, import, edit, and share. Supported import:{' '}
            {SUPPORTED_IMPORT_TYPES.map((t) => t.ext).join(', ')}
          </p>
        </div>
        <div className="actions">
          <button type="button" onClick={() => void createDoc()} disabled={busy}>
            New document
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            Import .txt / .md
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            hidden
            onChange={(e) => void onImport(e.target.files?.[0])}
          />
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && (
        <>
          <section>
            <h2>Owned</h2>
            {renderList(owned, 'No owned documents yet.')}
          </section>
          <section>
            <h2>Shared with me</h2>
            {renderList(shared, 'No shared documents yet.')}
          </section>
        </>
      )}
    </div>
  )
}
