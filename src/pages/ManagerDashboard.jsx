import Sidebar from '../components/Sidebar'

export default function ManagerDashboard() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar role="manager" />
      <main className="flex-1 px-10 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Manager Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Approvals, team activity, and documents.
          </p>
        </header>

        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Manager dashboard</p>
            <p className="mt-1 text-sm text-slate-400">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}
