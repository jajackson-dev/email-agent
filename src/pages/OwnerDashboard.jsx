import Sidebar from '../components/Sidebar'

export default function OwnerDashboard() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar role="owner" />
      <main className="flex-1 px-10 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Owner Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Workspace overview, billing, and team management.
          </p>
        </header>

        <ComingSoon label="Owner dashboard" />
      </main>
    </div>
  )
}

function ComingSoon({ label }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-white">
      <div className="text-center">
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="mt-1 text-sm text-slate-400">Coming soon</p>
      </div>
    </div>
  )
}
