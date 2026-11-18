import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { api, type User } from '../api/client'

type DemoUserContextValue = {
  users: User[]
  currentUser: User | null
  setCurrentUserId: (id: string) => void
  loading: boolean
  error: string | null
}

const DemoUserContext = createContext<DemoUserContextValue | null>(null)

const STORAGE_KEY = 'collabdocs.demoUserId'

export function DemoUserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { users: list } = await api.listUsers()
        if (cancelled) return
        setUsers(list)
        setCurrentUserIdState((prev) => {
          if (prev && list.some((u) => u.id === prev)) return prev
          const first = list[0]?.id ?? null
          if (first) localStorage.setItem(STORAGE_KEY, first)
          return first
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load users')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setCurrentUserId = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setCurrentUserIdState(id)
  }

  const currentUser = users.find((u) => u.id === currentUserId) ?? null

  return (
    <DemoUserContext.Provider
      value={{ users, currentUser, setCurrentUserId, loading, error }}
    >
      {children}
    </DemoUserContext.Provider>
  )
}

export function useDemoUser() {
  const ctx = useContext(DemoUserContext)
  if (!ctx) throw new Error('useDemoUser must be used within DemoUserProvider')
  return ctx
}
