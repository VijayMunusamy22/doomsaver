'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Wallet, FolderKanban, Users, LogOut } from 'lucide-react'
import { content } from '@/lib/content'
import { emitRouteLoadingStart } from '@/components/nav/route-progress'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: content.nav.items.dashboard },
  { href: '/income', icon: Wallet, label: content.nav.items.income },
  { href: '/categories', icon: FolderKanban, label: content.nav.items.categories },
  { href: '/family', icon: Users, label: content.nav.items.family },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function Sidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">₹</span>
          </div>
          <span className="font-bold text-foreground">{content.nav.brand}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (pathname !== href) emitRouteLoadingStart()
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name ?? content.nav.userFallback}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {content.nav.signOut}
        </button>
      </div>
    </aside>
  )
}
