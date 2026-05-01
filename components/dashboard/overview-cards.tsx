import { formatINR } from '@/lib/utils'
import { TrendingUp, PiggyBank, AlertCircle, Percent } from 'lucide-react'
import { content } from '@/lib/content'

interface Props {
  totalIncome: number
  totalAllocated: number
}

export function OverviewCards({ totalIncome, totalAllocated }: Props) {
  const unallocated = totalIncome - totalAllocated
  const pct = totalIncome > 0 ? Math.round((totalAllocated / totalIncome) * 100) : 0

  const cards = [
    {
      label: content.dashboard.overviewCards.monthlyIncome,
      value: formatINR(totalIncome),
      sub: `${formatINR(totalIncome * 12)} ${content.dashboard.overviewCards.yearSuffix}`,
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: content.dashboard.overviewCards.totalAllocated,
      value: formatINR(totalAllocated),
      sub: `${formatINR(totalAllocated * 12)} ${content.dashboard.overviewCards.yearSuffix}`,
      icon: PiggyBank,
      color: 'text-secondary-foreground',
      bg: 'bg-secondary/30',
    },
    {
      label: content.dashboard.overviewCards.unallocated,
      value: formatINR(Math.abs(unallocated)),
      sub:
        unallocated < 0
          ? content.dashboard.overviewCards.overBudget
          : content.dashboard.overviewCards.availableToAllocate,
      icon: AlertCircle,
      color: unallocated < 0 ? 'text-primary' : 'text-secondary-foreground',
      bg: unallocated < 0 ? 'bg-primary/10' : 'bg-secondary/30',
    },
    {
      label: content.dashboard.overviewCards.budgetCoverage,
      value: `${pct}%`,
      sub: content.dashboard.overviewCards.coverageSub,
      icon: Percent,
      color: 'text-secondary-foreground',
      bg: 'bg-secondary/30',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div key={label} className="glass-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">{label}</span>
            <div className={`${bg} p-2 rounded-lg`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
