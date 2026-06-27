import { ThemeToggle } from '../ui/ThemeToggle'

interface HeaderProps {
  connected: boolean
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function Header({ connected, sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] md:hidden"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold leading-tight md:text-xl">CryptoPulse</h1>
              <p className="hidden text-xs text-[var(--color-muted)] sm:block">Live Crypto Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
              connected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${connected ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'}`}
            />
            {connected ? 'Live' : 'Connecting…'}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
