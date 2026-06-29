import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/**
 * Navigation links available to each role. Keys map to the `role` column in
 * workspace_members. Supervisors share the manager surface.
 */
const NAV_BY_ROLE = {
  owner: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/manager', label: 'Team' },
    { to: '/chat', label: 'Assistant' },
  ],
  manager: [
    { to: '/manager', label: 'Dashboard' },
    { to: '/chat', label: 'Assistant' },
  ],
  supervisor: [
    { to: '/manager', label: 'Dashboard' },
    { to: '/chat', label: 'Assistant' },
  ],
  employee: [{ to: '/chat', label: 'Assistant' }],
}

/**
 * Role-aware sidebar shell used across the authenticated dashboards.
 * @param {{ role?: 'owner'|'manager'|'supervisor'|'employee' }} props
 */
export default function Sidebar({ role = 'employee' }) {
  const navigate = useNavigate()
  const links = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.employee

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          OT
        </span>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          OpsThreads
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              [
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-black/5 px-3 py-3">
        <div className="px-3 pb-2 text-xs uppercase tracking-wide text-slate-400">
          {role}
        </div>
        <button
          onClick={handleSignOut}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
