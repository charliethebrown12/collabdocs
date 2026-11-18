import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type Access, type Document } from '../api/client'
import { DocumentEditor } from '../components/DocumentEditor'
import { SharePanel } from '../components/SharePanel'
import { useDemoUser } from '../context/DemoUserContext'

export function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, users } = useDemoUser()
  const [document, setDocument] = useState<Document | null>(null)
  const [access, setAccess] = useState<Access | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<unknown>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const contentRef = useRef<unknown>(null)

  useEffect(() => {
    if (!currentUser || !id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await api.getDocument(currentUser.id, id)
        if (cancelled) return
        setDocument(data.document)
        setAccess(data.access)
        setTitle(data.document.title)
        setContent(data.document.content_json)
        contentRef.current = data.document.content_json
        setDirty(false)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load document')
          setDocument(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentUser, id])

  const canEdit = access === 'owner' || access === 'write'

  const save = async () => {
    if (!currentUser || !id || !canEdit) return
    const nextTitle = title.trim()
    if (!nextTitle) {
      setError('Title cannot be empty')
      return
    }
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const data = await api.updateDocument(currentUser.id, id, {
        title: nextTitle,
        content_json: contentRef.current,
      })
      setDocument(data.document)
      setAccess(data.access)
      setTitle(data.document.title)
      setContent(data.document.content_json)
      contentRef.current = data.document.content_json
      setDirty(false)
      setMessage('Saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading document…</p>
      </div>
    )
  }

  if (error && !document) {
    return (
      <div className="page">
        <p className="error">{error}</p>
        <Link to="/">Back to documents</Link>
      </div>
    )
  }

  if (!document || !currentUser) return null

  return (
    <div className="page">
      <div className="doc-nav">
        <Link to="/">← Documents</Link>
        <span className="badge">{access}</span>
      </div>

      <div className="title-row">
        <input
          className="title-input"
          value={title}
          disabled={!canEdit || saving}
          onChange={(e) => {
            setTitle(e.target.value)
            setDirty(true)
            setMessage(null)
          }}
          aria-label="Document title"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={!canEdit || saving || !dirty}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <DocumentEditor
        content={content}
        editable={canEdit}
        onChange={(json) => {
          contentRef.current = json
          setDirty(true)
          setMessage(null)
        }}
      />

      {access === 'owner' && (
        <SharePanel
          documentId={document.id}
          currentUserId={currentUser.id}
          users={users}
        />
      )}
    </div>
  )
}
