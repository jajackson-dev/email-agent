import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUserRole, roleHome } from '../lib/supabase'

/**
 * Gates a route behind a workspace role check.
 *
 * @param {object} props
 * @param {Array<'owner'|'manager'|'supervisor'|'employee'>} props.allow
 *   Roles permitted to view this route.
 * @param {React.ReactNode} props.children
 *
 * Assumes it is rendered inside a <ProtectedRoute> so a user is already
 * authenticated. If the user's role is not in `allow`, they are redirected to
 * the dashboard appropriate for their own role (or /login if they have none).
 */
export default function RoleGuard({ allow, children }) {
  const [state, setState] = useState({ loading: true, role: null })

  useEffect(() => {
    let active = true
    getCurrentUserRole().then((role) => {
      if (active) setState({ loading: false, role })
    })
    return () => {
      active = false
    }
  }, [])

  if (state.loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-cream">
        <span className="text-sm font-medium text-primary">Checking access…</span>
      </div>
    )
  }

  if (!state.role || !allow.includes(state.role)) {
    return <Navigate to={roleHome(state.role)} replace />
  }

  return children
}
