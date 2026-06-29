import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * Gates a route behind Supabase authentication.
 * While the session is loading we render a neutral splash; once resolved we
 * either render the children or redirect to /login.
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'authed' | 'anon'
  const location = useLocation()

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setStatus(data.session ? 'authed' : 'anon')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setStatus(session ? 'authed' : 'anon')
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') return <AuthSplash />
  if (status === 'anon') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}

function AuthSplash() {
  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-cream">
      <div className="flex items-center gap-3 text-primary">
        <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  )
}
