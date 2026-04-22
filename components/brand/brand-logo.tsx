import { cn } from '@/lib/utils'

interface BrandLogoProps {
  className?: string
  iconOnly?: boolean
  compact?: boolean
  withTagline?: boolean
}

export function BrandLogo({
  className,
  iconOnly = false,
  compact = false,
  withTagline = true,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', compact && 'gap-2.5', className)}>
      <span className={cn('relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/15 bg-primary/20', compact && 'h-9 w-9')}>
        <svg
          viewBox="0 0 48 48"
          className="h-7 w-7"
          aria-hidden
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="11" y="9" width="24" height="30" rx="3" fill="#C9922B" />
          <path d="M14 13h18v22H14z" fill="#E8B84B" />
          <path d="M12 22h22v4H12z" fill="#C9922B" />
          <path d="M30 11l7 4v22l-7 2z" fill="#1A1B22" opacity="0.85" />
          <circle cx="20" cy="18" r="2.6" fill="#1A1B22" />
          <path d="M24.5 18.5c1.2-1.3 3.1-1.3 4.4 0" stroke="#1A1B22" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 31.2c1.7 1.6 4.4 1.6 6.1 0" stroke="#1A1B22" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17.3 25c2.7 2.1 10.7 2.1 13.4 0" stroke="#1A1B22" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 9h22" stroke="#1A1B22" strokeWidth="1.5" opacity="0.35" />
          <path d="M16 39h22" stroke="#1A1B22" strokeWidth="1.5" opacity="0.35" />
        </svg>
      </span>
      {!iconOnly && (
        <span className="leading-tight">
          <span className={cn('block text-base font-semibold text-foreground', compact && 'text-sm')}>
            DoomSaver
          </span>
          {withTagline && (
            <span
              className={cn('block text-[11px] text-muted-foreground', compact && 'text-[10px]')}
            >
              Family Budget Planner
            </span>
          )}
        </span>
      )}
    </div>
  )
}
