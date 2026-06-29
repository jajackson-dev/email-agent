import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced in the browser console so a missing .env is obvious during setup.
  console.warn(
    '[OpsThreads] Missing Supabase env vars. Set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY in your .env file (see .env.example).',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Roles supported by OpsThreads, in descending privilege order.
 * @typedef {'owner' | 'manager' | 'supervisor' | 'employee'} Role
 */

/**
 * Map a workspace role to the dashboard route the user should land on.
 * @param {Role | null | undefined} role
 * @returns {string}
 */
export function roleHome(role) {
  switch (role) {
    case 'owner':
      return '/dashboard'
    case 'manager':
    case 'supervisor':
      return '/manager'
    case 'employee':
      return '/chat'
    default:
      return '/login'
  }
}

/**
 * Fetch the current user's role within their workspace.
 * Returns null when there is no authenticated user or no membership row.
 * @returns {Promise<Role | null>}
 */
export async function getCurrentUserRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[OpsThreads] Failed to load workspace role:', error.message)
    return null
  }
  return data?.role ?? null
}
