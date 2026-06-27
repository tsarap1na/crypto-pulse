import type { ReactNode } from 'react'

interface SidebarProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Sidebar({ open, onClose, children }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-transform duration-300 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col gap-4 overflow-y-auto pt-16 md:pt-0">{children}</div>
      </aside>
    </>
  )
}

interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
  sidebarOpen: boolean
  onCloseSidebar: () => void
}

export function Layout({ header, sidebar, children, sidebarOpen, onCloseSidebar }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-surface)]">
      {header}
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={onCloseSidebar}>
          {sidebar}
        </Sidebar>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
