'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const ROUTE_LOADING_EVENT = 'route:loading-start'

export function emitRouteLoadingStart() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(ROUTE_LOADING_EVENT))
}

export function RouteProgress() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)

  useEffect(() => {
    const start = () => setActive(true)
    window.addEventListener(ROUTE_LOADING_EVENT, start)
    return () => window.removeEventListener(ROUTE_LOADING_EVENT, start)
  }, [])

  useEffect(() => {
    if (!active) return
    const timeout = window.setTimeout(() => setActive(false), 260)
    return () => window.clearTimeout(timeout)
  }, [pathname, active])

  return (
    <div
      aria-hidden
      className={`route-progress ${active ? 'is-active' : ''}`}
    />
  )
}
