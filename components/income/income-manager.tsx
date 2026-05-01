'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pencil, Trash2, Plus, Wallet, Copy } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { content } from '@/lib/content'
import { formatPeriodLabel } from '@/lib/budgets'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type IncomeSource = 'PRIMARY' | 'SECONDARY' | 'SIDE'

interface IncomeUser {
  id: string
  name: string | null
  email: string
}

interface Income {
  id: string
  label: string
  amount: number
  type: IncomeSource
  periodKey: string
  user: IncomeUser
}

interface Member {
  id: string
  name: string | null
  email: string
}

const SOURCE_LABELS: Record<IncomeSource, string> = {
  PRIMARY: content.income.sources.PRIMARY,
  SECONDARY: content.income.sources.SECONDARY,
  SIDE: content.income.sources.SIDE,
}

const SOURCE_COLORS: Record<IncomeSource, string> = {
  PRIMARY: 'bg-primary/15 text-primary',
  SECONDARY: 'bg-secondary/25 text-secondary-foreground',
  SIDE: 'bg-foreground/10 text-foreground',
}

interface Props {
  initialIncomes: Income[]
  members: Member[]
  selectedPeriodKey: string
  periodOptions: string[]
  allowedTargetPeriods: string[]
}

export function IncomeManager({
  initialIncomes,
  members,
  selectedPeriodKey,
  periodOptions,
  allowedTargetPeriods,
}: Props) {
  const router = useRouter()
  const [incomes, setIncomes] = useState(initialIncomes)

  const defaultMemberId = members[0]?.id ?? ''
  const getEmptyForm = (userId = defaultMemberId) => ({
    label: '',
    amount: '',
    type: 'PRIMARY' as IncomeSource,
    userId,
  })

  const [form, setForm] = useState(getEmptyForm())
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [copying, setCopying] = useState(false)
  const [sourcePeriodKey, setSourcePeriodKey] = useState(selectedPeriodKey)
  const [targetPeriodKey, setTargetPeriodKey] = useState(allowedTargetPeriods[0] ?? selectedPeriodKey)

  useEffect(() => {
    setIncomes(initialIncomes)
    setSourcePeriodKey(selectedPeriodKey)
    setShowForm(false)
    setEditId(null)
    setForm(getEmptyForm(form.userId || defaultMemberId))
  }, [initialIncomes, selectedPeriodKey])

  const totalMonthly = useMemo(() => incomes.reduce((sum, income) => sum + income.amount, 0), [incomes])

  const onPeriodChange = (periodKey: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set('period', periodKey)
    router.push(`/income?${params.toString()}`)
  }

  const save = async () => {
    if (!form.label.trim() || !form.amount || !form.userId) return
    setLoading(true)

    const payload = {
      label: form.label.trim(),
      amount: Number(form.amount),
      type: form.type,
      userId: form.userId,
      periodKey: selectedPeriodKey,
    }

    if (editId) {
      const res = await fetch(`/api/income/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        setIncomes(prev => prev.map(income => (income.id === editId ? { ...income, ...updated } : income)))
      }
    } else {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const created = await res.json()
        setIncomes(prev => [...prev, created])
        router.refresh()
      }
    }

    setForm(getEmptyForm(form.userId || defaultMemberId))
    setEditId(null)
    setShowForm(false)
    setLoading(false)
  }

  const deleteIncome = async (id: string) => {
    if (!confirm(content.income.manager.deleteConfirm)) return
    const res = await fetch(`/api/income/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setIncomes(prev => prev.filter(income => income.id !== id))
    }
  }

  const startEdit = (income: Income) => {
    setForm({
      label: income.label,
      amount: String(income.amount),
      type: income.type,
      userId: income.user.id,
    })
    setEditId(income.id)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm(getEmptyForm(form.userId || defaultMemberId))
  }

  const copyIncomeToMonth = async () => {
    if (!sourcePeriodKey || !targetPeriodKey) return

    setCopying(true)
    const res = await fetch('/api/income/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourcePeriodKey, targetPeriodKey }),
    })
    setCopying(false)

    if (!res.ok) return

    onPeriodChange(targetPeriodKey)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{content.income.manager.periodLabel}</label>
            <Select value={selectedPeriodKey} onValueChange={onPeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder={content.income.manager.periodLabel} />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(periodKey => (
                  <SelectItem key={periodKey} value={periodKey}>
                    {formatPeriodLabel(periodKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:items-end justify-end">
            <p className="text-sm text-muted-foreground">{content.income.manager.summaryMonthly}</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatINR(totalMonthly)}</p>
            <p className="text-sm text-muted-foreground">{formatINR(totalMonthly * 12)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-4">
        <h3 className="font-semibold text-foreground">{content.income.manager.copyTitle}</h3>
        <p className="text-xs text-muted-foreground">{content.income.manager.copySubtitle}</p>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px_auto] gap-3">
          <Select value={sourcePeriodKey} onValueChange={setSourcePeriodKey}>
            <SelectTrigger>
              <SelectValue placeholder={content.income.manager.periodLabel} />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(periodKey => (
                <SelectItem key={periodKey} value={periodKey}>
                  {formatPeriodLabel(periodKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={targetPeriodKey} onValueChange={setTargetPeriodKey}>
            <SelectTrigger>
              <SelectValue placeholder={content.income.manager.copyAction} />
            </SelectTrigger>
            <SelectContent>
              {allowedTargetPeriods.map(periodKey => (
                <SelectItem key={periodKey} value={periodKey}>
                  {formatPeriodLabel(periodKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={copyIncomeToMonth}
            disabled={copying || !sourcePeriodKey || !targetPeriodKey}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
          >
            <Copy className="w-4 h-4" />
            {copying ? content.income.manager.copyLoading : content.income.manager.copyAction}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-card p-4 sm:p-6 space-y-4">
          <h3 className="font-semibold text-foreground">
            {editId ? content.income.manager.editTitle : content.income.manager.addTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.label}</label>
              <input
                autoFocus
                value={form.label}
                onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                placeholder={content.income.manager.placeholderLabel}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.amount}</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder={content.income.manager.placeholderAmount}
                min={0}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.member}</label>
              <Select
                value={form.userId}
                onValueChange={value => setForm(prev => ({ ...prev, userId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={content.income.manager.member} />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name?.trim() || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.source}</label>
              <Select
                value={form.type}
                onValueChange={value => setForm(prev => ({ ...prev, type: value as IncomeSource }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={content.income.manager.source} />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(SOURCE_LABELS) as [IncomeSource, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={cancelForm}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted w-full sm:w-auto"
            >
              {content.income.manager.cancel}
            </button>
            <button
              onClick={save}
              disabled={loading || !form.label.trim() || !form.amount || !form.userId}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 w-full sm:w-auto"
            >
              {loading
                ? content.income.manager.saveLoading
                : editId
                  ? content.income.manager.saveUpdate
                  : content.income.manager.saveCreate}
            </button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b">
          <h3 className="font-semibold text-foreground">{content.income.manager.listTitle}</h3>
          {!showForm && (
            <button
              onClick={() => {
                setEditId(null)
                setForm(getEmptyForm(form.userId || defaultMemberId))
                setShowForm(true)
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              {content.income.manager.addButton}
            </button>
          )}
        </div>

        {incomes.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-muted-foreground">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{content.income.manager.emptyTitle}</p>
            <p className="text-xs mt-1 text-muted-foreground/70">{content.income.manager.emptySubtitle}</p>
          </div>
        ) : (
          <div className="divide-y">
            {incomes.map(income => (
              <div
                key={income.id}
                className="flex flex-col sm:flex-row sm:items-center px-4 sm:px-6 py-4 gap-3 sm:gap-4"
              >
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 self-start ${SOURCE_COLORS[income.type]}`}
                >
                  {SOURCE_LABELS[income.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{income.label}</p>
                  <p className="text-xs text-muted-foreground">{income.user?.name ?? income.user?.email}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-foreground text-sm">
                    {formatINR(income.amount)}
                    <span className="text-muted-foreground font-normal">{content.income.manager.monthSuffix}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(income.amount * 12)}
                    {content.income.manager.yearSuffix}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => startEdit(income)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteIncome(income.id)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
