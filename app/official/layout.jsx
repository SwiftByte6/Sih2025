'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Bell, LayoutGrid, FileText, Siren, ScrollText, ClipboardList, User } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

function DesktopSidebar() {
  const pathname = usePathname()
  const links = [
    { href: '/official/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/official/reports', label: 'Reports', icon: FileText },
    { href: '/official/alerts', label: 'Alerts', icon: Siren },
    { href: '/official/notices', label: 'Notices', icon: ScrollText },
    { href: '/official/logs', label: 'Logs', icon: ClipboardList },
  ]
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white text-gray-900 border-r border-gray-200">
      <div className="h-16 flex items-center px-6 text-xl font-bold">
        <img src="/Logo.png" alt="CoastSafe" className="w-8 h-8 mr-3" />
        CoastSafe
      </div>
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
      <LogoutButton/>
      <div className="p-4 border-t border-gray-800 text-sm text-gray-300">
        Official Console
       
      </div>
    </aside>
  )
}

function TopNavbar({ onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 bg-white/80 backdrop-blur border-b border-gray-200 lg:pl-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100" onClick={onOpenMobileNav} aria-label="Open menu">
          <Menu size={20} className="text-gray-700" />
        </button>
        <div className="hidden lg:flex items-center gap-2 text-gray-700">
          <img src="/Logo.png" alt="CoastSafe" className="w-6 h-6" />
          <span className="font-semibold">Official Dashboard</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-gray-100" aria-label="Notifications">
          <Bell size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 text-gray-700">
          <User size={18} />
          <span className="hidden sm:inline">Official</span>
        </div>
      </div>
    </header>
  )
}

function MobileSidebarLinks({ onNavigate }) {
  const pathname = usePathname()
  const links = [
    { href: '/official/dashboard', label: 'Dashboard' },
    { href: '/official/reports', label: 'Reports' },
    { href: '/official/alerts', label: 'Alerts' },
    { href: '/official/notices', label: 'Notices' },
    { href: '/official/logs', label: 'Logs' },
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

function MobileBottomNav() {
  const pathname = usePathname()
  const links = [
    { href: '/official/dashboard', label: 'Home', icon: LayoutGrid },
    { href: '/official/reports', label: 'Reports', icon: FileText },
    { href: '/official/alerts', label: 'Alerts', icon: Siren },
    { href: '/official/notices', label: 'Notices', icon: ScrollText },
  ]
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200">
      <div className="grid grid-cols-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex flex-col items-center justify-center py-2 text-xs ${active ? 'text-sky-600' : 'text-gray-600'}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function OfficialLayout({ children }) {
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
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <img src="/Logo.png" alt="CoastSafe" className="w-6 h-6" />
              CoastSafe
            </div>
            <MobileSidebarLinks onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <MobileBottomNav />
    </div>
  )
}


