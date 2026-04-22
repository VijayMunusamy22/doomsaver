'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, Wallet } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { content } from '@/lib/content'

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
}

export function IncomeManager({ initialIncomes, members }: Props) {
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

  const totalMonthly = incomes.reduce((s, i) => s + i.amount, 0)

  const save = async () => {
    if (!form.label.trim() || !form.amount || !form.userId) return
    setLoading(true)

    const payload = {
      label: form.label.trim(),
      amount: Number(form.amount),
      type: form.type,
      userId: form.userId,
    }

    if (editId) {
      const res = await fetch(`/api/income/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        setIncomes(p => p.map(i => (i.id === editId ? { ...i, ...updated } : i)))
      }
    } else {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const created = await res.json()
        setIncomes(p => [...p, created])
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
    if (res.ok) setIncomes(p => p.filter(i => i.id !== id))
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

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <div className="bg-card rounded-2xl border p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{content.income.manager.summaryMonthly}</p>
          <p className="text-3xl font-bold text-foreground">{formatINR(totalMonthly)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{content.income.manager.summaryAnnual}</p>
          <p className="text-xl font-semibold text-foreground">{formatINR(totalMonthly * 12)}</p>
        </div>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-card rounded-2xl border p-6 space-y-4">
          <h3 className="font-semibold text-foreground">
            {editId ? content.income.manager.editTitle : content.income.manager.addTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.label}</label>
              <input
                autoFocus
                value={form.label}
                onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
                placeholder={content.income.manager.placeholderLabel}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.amount}</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder={content.income.manager.placeholderAmount}
                min={0}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.member}</label>
              <select
                value={form.userId}
                onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name?.trim() || member.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{content.income.manager.source}</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as IncomeSource }))}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {(Object.entries(SOURCE_LABELS) as [IncomeSource, string][]).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={cancelForm}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              {content.income.manager.cancel}
            </button>
            <button
              onClick={save}
              disabled={loading || !form.label.trim() || !form.amount || !form.userId}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
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

      {/* List */}
      <div className="bg-card rounded-2xl border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
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
          <div className="p-12 text-center text-muted-foreground">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{content.income.manager.emptyTitle}</p>
            <p className="text-xs mt-1 text-muted-foreground/70">{content.income.manager.emptySubtitle}</p>
          </div>
        ) : (
          <div className="divide-y">
            {incomes.map(income => (
              <div key={income.id} className="flex items-center px-6 py-4 gap-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${SOURCE_COLORS[income.type]}`}
                >
                  {SOURCE_LABELS[income.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{income.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {income.user?.name ?? income.user?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">
                    {formatINR(income.amount)}
                    <span className="text-muted-foreground font-normal">
                      {content.income.manager.monthSuffix}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(income.amount * 12)}
                    {content.income.manager.yearSuffix}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
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
