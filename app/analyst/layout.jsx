'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Bell, LogOut, BarChart3, FileText, LayoutGrid, User, MapPinned } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

function DesktopSidebar() {
  const pathname = usePathname()
  const links = [
    { href: '/analyst/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/analyst/reports', label: 'Reports', icon: FileText },
    { href: '/analyst/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/analyst/alerts', label: 'Alerts', icon: Bell },
    { href: '/analyst/profile', label: 'Profile', icon: User },
  ]
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white text-foreground border-r border-border">
      <div className="h-16 flex items-center px-6 text-xl font-bold text-foreground">
        <img src="/Logo.png" alt="CoastSafe" className="w-8 h-8 mr-3" />
        CoastSafe
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-brand/10 text-foreground' : 'text-foreground/70 hover:bg-brand/10 hover:text-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30`}>
              <Icon size={18} className={active ? 'text-foreground' : 'text-foreground/70'} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <LogoutButton />
      </div>
    </aside>
  )
}

function TopNavbar({ onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 bg-white border-b border-border lg:pl-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-md hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30" onClick={onOpenMobileNav} aria-label="Open menu">
          <Menu size={20} className="text-foreground" />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-foreground">
          <img src="/Logo.png" alt="CoastSafe" className="w-6 h-6" />
          <span className="font-semibold">Analyst Console</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30" aria-label="Notifications">
          <Bell size={20} className="text-foreground/80" />
        </button>
        <LogoutButton />
      </div>
    </header>
  )
}

function MobileBottomNav() {
  const pathname = usePathname()
  const links = [
    { href: '/analyst/dashboard', label: 'Home', icon: LayoutGrid },
    { href: '/analyst/reports', label: 'Reports', icon: FileText },
    { href: '/analyst/alerts', label: 'Alerts', icon: Bell },
    { href: '/analyst/profile', label: 'Profile', icon: User },
  ]
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border">
      <div className="grid grid-cols-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex flex-col items-center justify-center py-2 text-xs ${active ? 'text-foreground' : 'text-foreground/70'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30`}>
              <Icon size={18} className={active ? 'text-foreground' : 'text-foreground/70'} />
              <span className="mt-0.5">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function AnalystLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="min-h-dvh bg-surface text-foreground">
      <div className="flex">
        <DesktopSidebar />
        <div className="flex-1 min-w-0">
          <TopNavbar onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="px-4 lg:px-6 py-4 pb-20 lg:pb-6">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Page header slot: each page can render its own h1/subtitle */}
              {children}
            </div>
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white border-r border-border p-4">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-foreground">
              <img src="/Logo.png" alt="CoastSafe" className="w-6 h-6" />
              CoastSafe
            </div>
            {/* Reuse DesktopSidebar links simple */}
            <MobileSidebarLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  )
}

function MobileSidebarLinks({ onNavigate }) {
  const pathname = usePathname()
  const links = [
    { href: '/analyst/dashboard', label: 'Dashboard' },
    { href: '/analyst/reports', label: 'Reports' },
    { href: '/analyst/analytics', label: 'Analytics' },
    { href: '/analyst/alerts', label: 'Alerts' },
    { href: '/analyst/profile', label: 'Profile' },
  ]
  return (
    <div className="space-y-1">
      {links.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} onClick={onNavigate} className={`block px-3 py-2 rounded-md transition-colors ${active ? 'bg-brand/10 text-foreground' : 'text-foreground/70 hover:bg-brand/10 hover:text-foreground'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30`}>
            {label}
          </Link>
        )
      })}
    </div>
  )
}


