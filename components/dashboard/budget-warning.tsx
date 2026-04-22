import { AlertTriangle } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { content } from '@/lib/content'

interface Props {
  totalIncome: number
  totalAllocated: number
}

export function BudgetWarning({ totalIncome, totalAllocated }: Props) {
  if (totalAllocated <= totalIncome || totalIncome === 0) return null

  const overBy = totalAllocated - totalIncome
  const title = content.dashboard.budgetWarning.title.replace('{overBy}', formatINR(overBy))
  const description = content.dashboard.budgetWarning.description
    .replace('{totalAllocated}', formatINR(totalAllocated))
    .replace('{totalIncome}', formatINR(totalIncome))

  return (
    <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 text-foreground rounded-xl px-5 py-4">
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}
