import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { PrototypeBanner } from './components/PrototypeBanner'
import { DemoUserProvider, useDemoUser } from './context/DemoUserContext'
import { DocumentPage } from './pages/DocumentPage'
import { HomePage } from './pages/HomePage'

function Shell() {
  const { users, currentUser, setCurrentUserId, loading, error } = useDemoUser()

  return (
    <div className="app">
      <PrototypeBanner />
      <header className="topbar">
        <div className="brand">
          <Link to="/" className="brand-name">
            CollabDocs
          </Link>
          <span className="tagline">Collaborative documents</span>
        </div>
        <div className="identity">
          <label htmlFor="demo-user">Acting as</label>
          <select
            id="demo-user"
            value={currentUser?.id ?? ''}
            onChange={(e) => setCurrentUserId(e.target.value)}
            disabled={loading || users.length === 0}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main>
        {loading && <p className="muted page">Loading demo users…</p>}
        {error && <p className="error page">{error}</p>}
        {!loading && !error && currentUser && (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/documents/:id" element={<DocumentPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <DemoUserProvider>
      <Shell />
    </DemoUserProvider>
  )
}
