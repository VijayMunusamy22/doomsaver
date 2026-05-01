'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Save, FolderKanban } from 'lucide-react'
import { content } from '@/lib/content'
import { formatINR } from '@/lib/utils'
import { formatPeriodLabel } from '@/lib/budgets'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SubCategory {
  id: string
  name: string
  budgetAmount: number
  managerId?: string | null
  note?: string | null
}

interface Category {
  id: string
  name: string
  color: string
  subCategories: SubCategory[]
}

interface BudgetOption {
  id: string
  name: string
  periodKey: string
  kind: 'MASTER' | 'MONTHLY'
  displayName: string
}

interface Member {
  id: string
  name: string | null
  email: string
}

interface SubDraft {
  budgetAmount: string
  managerId: string
  note: string
}

interface Props {
  budgets: BudgetOption[]
  selectedBudgetId: string
  initialCategories: Category[]
  members: Member[]
  allowedTargetPeriods: string[]
}

function buildDrafts(categories: Category[]) {
  const drafts: Record<string, SubDraft> = {}
  categories.forEach(category => {
    category.subCategories.forEach(sub => {
      drafts[sub.id] = {
        budgetAmount: String(sub.budgetAmount),
        managerId: sub.managerId ?? '',
        note: sub.note ?? '',
      }
    })
  })
  return drafts
}

export function BudgetManager({
  budgets,
  selectedBudgetId,
  initialCategories,
  members,
  allowedTargetPeriods,
}: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [drafts, setDrafts] = useState<Record<string, SubDraft>>(buildDrafts(initialCategories))
  const [savingSubId, setSavingSubId] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)

  const defaultSource = selectedBudgetId || budgets[0]?.id || ''
  const [sourceBudgetId, setSourceBudgetId] = useState(defaultSource)
  const [targetPeriodKey, setTargetPeriodKey] = useState(allowedTargetPeriods[0] ?? '')

  useEffect(() => {
    setCategories(initialCategories)
    setDrafts(buildDrafts(initialCategories))
  }, [initialCategories])

  useEffect(() => {
    setSourceBudgetId(defaultSource)
  }, [defaultSource])

  const totalAllocated = useMemo(
    () =>
      categories.reduce(
        (sum, category) =>
          sum + category.subCategories.reduce((subTotal, sub) => subTotal + sub.budgetAmount, 0),
        0,
      ),
    [categories],
  )

  const onSelectBudget = (budgetId: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('budget', budgetId)
    router.push(`/budgets?${params.toString()}`)
  }

  const saveSubCategory = async (subId: string, categoryId: string) => {
    const draft = drafts[subId]
    if (!draft) return

    setSavingSubId(subId)
    const res = await fetch(`/api/subcategories/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        budgetAmount: Number(draft.budgetAmount || 0),
        managerId: draft.managerId || null,
        note: draft.note.trim() || null,
      }),
    })

    setSavingSubId(null)
    if (!res.ok) return

    const updated = await res.json()
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: category.subCategories.map(sub => (sub.id === subId ? updated : sub)),
            }
          : category,
      ),
    )
  }

  const copyBudget = async () => {
    if (!sourceBudgetId || !targetPeriodKey) return

    setCopying(true)
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'MONTHLY',
        sourceBudgetId,
        targetPeriodKey,
      }),
    })
    setCopying(false)

    if (!res.ok) return
    const copied = await res.json()
    router.push(`/budgets?budget=${copied.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{content.budgets.selectorLabel}</label>
            <Select value={selectedBudgetId} onValueChange={onSelectBudget}>
              <SelectTrigger>
                <SelectValue placeholder={content.budgets.selectorLabel} />
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
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">{content.budgets.summaryMonthly}</p>
            <p className="text-2xl font-bold text-foreground">{formatINR(totalAllocated)}</p>
            <p className="text-xs text-muted-foreground">
              {formatINR(totalAllocated * 12)} {content.budgets.summaryYearSuffix}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-4">
        <h3 className="font-semibold text-foreground">{content.budgets.copyTitle}</h3>
        <p className="text-xs text-muted-foreground">{content.budgets.copySubtitle}</p>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px_auto] gap-3">
          <Select value={sourceBudgetId} onValueChange={setSourceBudgetId}>
            <SelectTrigger>
              <SelectValue placeholder={content.budgets.selectorLabel} />
            </SelectTrigger>
            <SelectContent>
              {budgets.map(budget => (
                <SelectItem key={budget.id} value={budget.id}>
                  {budget.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={targetPeriodKey} onValueChange={setTargetPeriodKey}>
            <SelectTrigger>
              <SelectValue placeholder={content.budgets.copyAction} />
            </SelectTrigger>
            <SelectContent>
              {allowedTargetPeriods.map(period => (
                <SelectItem key={period} value={period}>
                  {formatPeriodLabel(period)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={copyBudget}
            disabled={copying || !sourceBudgetId || !targetPeriodKey}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            <Copy className="w-4 h-4" />
            {copying ? content.budgets.copyLoading : content.budgets.copyAction}
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 text-center text-muted-foreground">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{content.budgets.emptyTitle}</p>
          <p className="text-xs mt-1 text-muted-foreground/70">{content.budgets.emptySubtitle}</p>
          <Link
            href="/categories"
            className="inline-flex mt-4 text-sm text-primary font-medium hover:underline"
          >
            {content.budgets.emptyAction}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id} className="glass-card overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <p className="font-semibold text-sm text-foreground">{category.name}</p>
              </div>
              <div>
                {category.subCategories.map(sub => {
                  const draft = drafts[sub.id] ?? {
                    budgetAmount: String(sub.budgetAmount),
                    managerId: sub.managerId ?? '',
                    note: sub.note ?? '',
                  }

                  return (
                    <div
                      key={sub.id}
                      className="px-4 sm:px-5 py-3 border-b last:border-b-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_140px_180px_minmax(0,1fr)_auto] gap-2 items-center"
                    >
                      <p className="text-sm text-foreground">{sub.name}</p>
                      <input
                        type="number"
                        value={draft.budgetAmount}
                        onChange={e =>
                          setDrafts(prev => ({
                            ...prev,
                            [sub.id]: {
                              ...draft,
                              budgetAmount: e.target.value,
                            },
                          }))
                        }
                        placeholder={content.budgets.amountPlaceholder}
                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Select
                        value={draft.managerId || '__unassigned__'}
                        onValueChange={value =>
                          setDrafts(prev => ({
                            ...prev,
                            [sub.id]: {
                              ...draft,
                              managerId: value === '__unassigned__' ? '' : value,
                            },
                          }))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={content.common.labels.unassigned} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__unassigned__">
                            {content.common.labels.unassigned}
                          </SelectItem>
                          {members.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name?.trim() || member.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input
                        value={draft.note}
                        onChange={e =>
                          setDrafts(prev => ({
                            ...prev,
                            [sub.id]: {
                              ...draft,
                              note: e.target.value,
                            },
                          }))
                        }
                        placeholder={content.budgets.notePlaceholder}
                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        onClick={() => saveSubCategory(sub.id, category.id)}
                        disabled={savingSubId === sub.id}
                        className="inline-flex items-center justify-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-60"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {savingSubId === sub.id ? content.budgets.savingAction : content.budgets.saveAction}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
