import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AuthLayout, Field } from './Login'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Supabase returns session: null for two reasons:
    // 1. Email confirmation is enabled (identities array is populated)
    // 2. The email is already registered (identities array is empty)
    if (!data.session) {
      if (data.user?.identities?.length === 0) {
        setError('An account with this email already exists. Please sign in instead.')
      } else {
        setNotice('Check your email to confirm your account, then sign in.')
      }
      return
    }

    // New accounts begin as workspace owners and go straight to onboarding.
    navigate('/onboarding', { replace: true })
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="Start your OpsThreads account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-primary">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
