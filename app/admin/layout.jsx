'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Users, FileText, Siren, ScrollText, Bell, ClipboardList } from 'lucide-react'

function DesktopSidebar() {
  const pathname = usePathname()
  const links = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutGrid },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
    { href: '/admin/alerts', label: 'Alerts', icon: Siren },
    { href: '/admin/notices', label: 'Notices', icon: ScrollText },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/logs', label: 'System Logs', icon: ClipboardList },
  ]
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white text-gray-900 border-r border-gray-200">
      <div className="h-16 flex items-center px-6 text-xl font-bold">Admin</div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
        Admin Console
      </div>
    </aside>
  )
}

function TopNavbar({ onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 bg-white/80 backdrop-blur border-b border-gray-200 lg:pl-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={onOpenMobileNav} aria-label="Open menu">
          <LayoutGrid size={20} className="text-gray-700" />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-gray-700">
          <ClipboardList size={18} />
          <span className="font-semibold">Administration</span>
        </div>
      </div>
    </header>
  )
}

function MobileSidebarLinks({ onNavigate }) {
  const pathname = usePathname()
  const links = [
    { href: '/admin/dashboard', label: 'Overview' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/alerts', label: 'Alerts' },
    { href: '/admin/notices', label: 'Notices' },
    { href: '/admin/notifications', label: 'Notifications' },
    { href: '/admin/logs', label: 'System Logs' },
  ]
  return (
    <div className="space-y-1">
      {links.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} onClick={onNavigate} className={`block px-3 py-2 rounded-md ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
            {label}
          </Link>
        )
      })}
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="min-h-dvh bg-white text-gray-900">
      <div className="flex">
        <DesktopSidebar />
        <div className="flex-1 min-w-0">
          <TopNavbar onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="px-4 lg:px-6 py-4 pb-20 lg:pb-6">
            {children}
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white border-r border-gray-200 p-4">
            <div className="text-lg font-semibold mb-4">Admin</div>
            <MobileSidebarLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}


