'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Wallet, FolderKanban, Users, LogOut, Menu, X, PiggyBank } from 'lucide-react'
import { content } from '@/lib/content'
import { emitRouteLoadingStart } from '@/components/nav/route-progress'
import { BrandLogo } from '@/components/brand/brand-logo'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: content.nav.items.dashboard },
  { href: '/income', icon: Wallet, label: content.nav.items.income },
  { href: '/categories', icon: FolderKanban, label: content.nav.items.categories },
  { href: '/budgets', icon: PiggyBank, label: content.nav.items.budgets },
  { href: '/family', icon: Users, label: content.nav.items.family },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export function Sidebar({ user }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  const onNavigate = (href: string) => {
    if (pathname !== href) emitRouteLoadingStart()
    setMobileOpen(false)
  }

  const onSignOut = () => {
    setMobileOpen(false)
    signOut({ callbackUrl: '/login' })
  }

  const navContent = (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onNavigate(href)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary/92 text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.35)]'
                  : 'text-muted-foreground hover:bg-white/45 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/35">
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
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {content.nav.signOut}
        </button>
      </div>
    </>
  )

  return (
    <>
      <header className="lg:hidden fixed inset-x-0 top-0 z-40 h-14 border-b border-white/35 bg-white/58 backdrop-blur-xl">
        <div className="h-full flex items-center justify-between px-3">
          <button
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <BrandLogo compact withTagline={false} />
          <div className="w-9" />
        </div>
      </header>

      <aside className="hidden lg:flex h-full w-64 flex-shrink-0 border-r border-white/35 bg-white/44 backdrop-blur-xl flex-col shadow-[0_18px_36px_hsl(231_18%_14%/0.08)]">
        <div className="h-16 flex items-center px-6 border-b border-white/35">
          <BrandLogo compact withTagline={false} />
        </div>
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-foreground/45"
          />
          <aside className="absolute inset-y-0 left-0 w-[84vw] max-w-80 border-r border-white/35 bg-white/70 backdrop-blur-xl shadow-2xl flex flex-col">
            <div className="h-14 border-b border-white/35 px-3 flex items-center justify-between">
              <BrandLogo compact withTagline={false} />
              <button
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}
