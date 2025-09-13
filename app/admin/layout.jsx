'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutGrid, 
  Users, 
  FileText, 
  Siren, 
  ScrollText, 
  Bell, 
  ClipboardList,
  Settings,
  BarChart3,
  Shield,
  Activity,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

function DesktopSidebar() {
  const pathname = usePathname()
  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid, badge: null },
    { href: '/admin/users', label: 'Users', icon: Users, badge: null },
    { href: '/admin/reports', label: 'Reports', icon: FileText, badge: null },
    { href: '/admin/alerts', label: 'Alerts', icon: Siren, badge: '3' },
    { href: '/admin/notices', label: 'Notices', icon: ScrollText, badge: null },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell, badge: '12' },
    { href: '/admin/logs', label: 'System Logs', icon: ClipboardList, badge: null },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, badge: null },
  
  ]
  
  return (
    <aside className="hidden lg:flex lg:flex-col w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Logo and Brand */}
      <div className="h-20 flex items-center px-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <img src="/Logo.png" alt="Admin Console" className="w-10 h-10 rounded-lg" />
          <div>
            <h1 className="text-xl font-bold">Admin Console</h1>
            <p className="text-xs text-gray-400">Coastal Safety Platform</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href
          return (
            <Link 
              key={href} 
              href={href} 
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                <span className="font-medium">{label}</span>
              </div>
              {badge && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  active 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
        <LogoutButton/>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-700/50">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@coastalsafety.gov</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

function TopNavbar({ onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-30 h-20 flex items-center justify-between px-6 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" 
          onClick={onOpenMobileNav} 
          aria-label="Open menu"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <div className="flex items-center gap-3">
          <img src="/Logo.png" alt="Admin Console" className="w-8 h-8 rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Console</h1>
            <p className="text-xs text-gray-500">Coastal Safety Platform</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">System Online</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell className="w-4 h-4 text-gray-600" />
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileSidebarLinks({ onNavigate }) {
  const pathname = usePathname()
  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
    { href: '/admin/alerts', label: 'Alerts', icon: Siren },
    { href: '/admin/notices', label: 'Notices', icon: ScrollText },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
    { href: '/admin/logs', label: 'System Logs', icon: ClipboardList },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]
  
  return (
    <div className="space-y-2">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link 
            key={href} 
            href={href} 
            onClick={onNavigate} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              active 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DesktopSidebar />
        <div className="flex-1 min-w-0">
          <TopNavbar onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setMobileOpen(false)} 
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img src="/Logo.png" alt="Admin Console" className="w-8 h-8 rounded-lg" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Admin Console</h1>
                  <p className="text-xs text-gray-500">Coastal Safety Platform</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <MobileSidebarLinks onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


