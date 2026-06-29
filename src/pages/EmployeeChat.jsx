import Sidebar from '../components/Sidebar'

export default function EmployeeChat() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar role="employee" />
      <main className="flex flex-1 flex-col px-10 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ask questions about your workspace documents and procedures.
          </p>
        </header>

        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-white">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Chat assistant</p>
            <p className="mt-1 text-sm text-slate-400">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}
