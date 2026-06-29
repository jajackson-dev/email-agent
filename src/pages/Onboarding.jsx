import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const INDUSTRIES = [
  'Construction',
  'Food & Beverage',
  'Healthcare',
  'Logistics',
  'Manufacturing',
  'Professional Services',
  'Retail',
  'Technology',
  'Other',
]

const TEAM_SIZES = ['1–5', '6–15', '16–50', '51–200', '200+']

export default function Onboarding() {
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: rpcError } = await supabase.rpc('create_workspace', {
      workspace_name: businessName.trim(),
      workspace_industry: industry || null,
      workspace_team_size: teamSize || null,
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            OT
          </span>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            OpsThreads
          </span>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Set up your workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell us about your team so we can tailor OpsThreads to you.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Business name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                placeholder="Acme Inc."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Industry
              </span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select industry…</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Team size
              </span>
              <select
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select team size…</option>
                {TEAM_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? 'Creating workspace…' : 'Continue to dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
