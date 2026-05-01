'use client'

import { useRouter } from 'next/navigation'
import { content } from '@/lib/content'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BudgetOption {
  id: string
  displayName: string
}

interface Props {
  budgets: BudgetOption[]
  selectedBudgetId: string
}

export function DashboardBudgetSelector({ budgets, selectedBudgetId }: Props) {
  const router = useRouter()

  const onChange = (budgetId: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('budget', budgetId)
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="w-full sm:w-72">
      <label className="block text-xs text-muted-foreground mb-1.5">
        {content.dashboard.selectorLabel}
      </label>
      <Select value={selectedBudgetId} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={content.dashboard.selectorLabel} />
        </SelectTrigger>
        <SelectContent>
          {budgets.map(budget => (
            <SelectItem key={budget.id} value={budget.id}>
              {budget.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
