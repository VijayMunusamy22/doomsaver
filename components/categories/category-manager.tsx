'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  FolderKanban,
} from 'lucide-react'
import { formatINR, CATEGORY_COLORS } from '@/lib/utils'
import { content } from '@/lib/content'

interface SubCategory {
  id: string
  name: string
  budgetAmount: number
  categoryId: string
  managerId?: string | null
  note?: string | null
}

interface Category {
  id: string
  name: string
  color: string
  subCategories: SubCategory[]
}

interface Member {
  id: string
  name: string | null
  email: string
}

interface Props {
  initialCategories: Category[]
  members: Member[]
}

export function CategoryManager({ initialCategories, members }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // New category form
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0])

  // Edit category inline
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')

  // New subcategory per category
  const [newSubName, setNewSubName] = useState<Record<string, string>>({})
  const [newSubAmount, setNewSubAmount] = useState<Record<string, string>>({})
  const [newSubManagerId, setNewSubManagerId] = useState<Record<string, string>>({})
  const [newSubNote, setNewSubNote] = useState<Record<string, string>>({})

  // Edit subcategory inline
  const [editSubId, setEditSubId] = useState<string | null>(null)
  const [editSubData, setEditSubData] = useState({
    name: '',
    budgetAmount: '',
    managerId: '',
    note: '',
  })

  const totalAllocated = categories.reduce(
    (s, c) => s + c.subCategories.reduce((ss, sub) => ss + sub.budgetAmount, 0),
    0,
  )

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const getMemberLabel = (managerId?: string | null) => {
    if (!managerId) return content.common.labels.unassigned
    const member = members.find(m => m.id === managerId)
    if (!member) return content.common.labels.unassigned
    return member.name?.trim() || member.email
  }

  // ── Category CRUD ──────────────────────────────────────────
  const addCategory = async () => {
    if (!newCatName.trim()) return
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName, color: newCatColor }),
    })
    if (res.ok) {
      const cat = await res.json()
      setCategories(p => [...p, cat])
      setNewCatName('')
      setNewCatColor(CATEGORY_COLORS[0])
      setShowNewCat(false)
      setExpanded(prev => {
        const next = new Set(prev)
        next.add(cat.id)
        return next
      })
    }
  }

  const saveEditCat = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editCatName }),
    })
    if (res.ok) {
      setCategories(p => p.map(c => (c.id === id ? { ...c, name: editCatName } : c)))
      setEditCatId(null)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm(content.categories.manager.deleteCategoryConfirm)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) setCategories(p => p.filter(c => c.id !== id))
  }

  // ── Subcategory CRUD ───────────────────────────────────────
  const addSubCategory = async (categoryId: string) => {
    const name = newSubName[categoryId]?.trim()
    const amount = Number(newSubAmount[categoryId] ?? 0)
    const managerId = newSubManagerId[categoryId] ?? ''
    const note = (newSubNote[categoryId] ?? '').trim()
    if (!name) return

    const res = await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        budgetAmount: amount,
        categoryId,
        managerId: managerId || null,
        note: note || null,
      }),
    })
    if (res.ok) {
      const sub = await res.json()
      setCategories(p =>
        p.map(c =>
          c.id === categoryId ? { ...c, subCategories: [...c.subCategories, sub] } : c,
        ),
      )
      setNewSubName(p => ({ ...p, [categoryId]: '' }))
      setNewSubAmount(p => ({ ...p, [categoryId]: '' }))
      setNewSubManagerId(p => ({ ...p, [categoryId]: '' }))
      setNewSubNote(p => ({ ...p, [categoryId]: '' }))
    }
  }

  const saveEditSub = async (subId: string, catId: string) => {
    const res = await fetch(`/api/subcategories/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editSubData.name,
        budgetAmount: Number(editSubData.budgetAmount),
        managerId: editSubData.managerId || null,
        note: editSubData.note || null,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCategories(p =>
        p.map(c =>
          c.id === catId
            ? { ...c, subCategories: c.subCategories.map(s => (s.id === subId ? updated : s)) }
            : c,
        ),
      )
      setEditSubId(null)
    }
  }

  const deleteSubCategory = async (subId: string, catId: string) => {
    const res = await fetch(`/api/subcategories/${subId}`, { method: 'DELETE' })
    if (res.ok) {
      setCategories(p =>
        p.map(c =>
          c.id === catId
            ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subId) }
            : c,
        ),
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="bg-card rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground font-medium">
          {content.categories.manager.summaryMonthly}
        </p>
        <div className="text-left sm:text-right">
          <p className="text-xl sm:text-2xl font-bold text-foreground">{formatINR(totalAllocated)}</p>
          <p className="text-xs text-muted-foreground">
            {formatINR(totalAllocated * 12)} {content.categories.manager.summaryYearSuffix}
          </p>
        </div>
      </div>

      {/* Category list */}
      {categories.length === 0 && !showNewCat && (
        <div className="bg-card rounded-2xl border p-8 sm:p-12 text-center text-muted-foreground">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{content.categories.manager.emptyTitle}</p>
          <p className="text-xs mt-1 text-muted-foreground/70">
            {content.categories.manager.emptySubtitle}
          </p>
        </div>
      )}

      {categories.map(cat => {
        const catTotal = cat.subCategories.reduce((s, sub) => s + sub.budgetAmount, 0)
        const isOpen = expanded.has(cat.id)

        return (
          <div key={cat.id} className="bg-card rounded-2xl border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-3 sm:px-5 py-4">
              <button
                onClick={() => toggle(cat.id)}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />

              {editCatId === cat.id ? (
                <input
                  autoFocus
                  value={editCatName}
                  onChange={e => setEditCatName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEditCat(cat.id)
                    if (e.key === 'Escape') setEditCatId(null)
                  }}
                  className="flex-1 border-b-2 border-primary outline-none text-sm font-semibold bg-transparent py-0.5"
                />
              ) : (
                <span className="flex-1 font-semibold text-foreground text-sm">{cat.name}</span>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                  {formatINR(catTotal)}
                  {content.categories.manager.monthlyBudgetSuffix}
                </span>
                <span className="text-xs text-muted-foreground/70 hidden sm:block">
                  · {cat.subCategories.length} {content.categories.manager.itemCountSuffix}
                </span>
                {editCatId === cat.id ? (
                  <>
                    <button
                      onClick={() => saveEditCat(cat.id)}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditCatId(null)}
                      className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name) }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Subcategories */}
            {isOpen && (
              <div className="border-t bg-muted/60">
                {cat.subCategories.length === 0 && (
                  <p className="px-4 sm:px-10 py-3 text-xs text-muted-foreground">
                    {content.categories.manager.subEmpty}
                  </p>
                )}

                {cat.subCategories.map(sub => (
                  <div key={sub.id} className="px-4 sm:px-10 py-3 border-b last:border-b-0">
                    {editSubId === sub.id ? (
                      <div className="flex flex-col sm:flex-row items-start gap-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_180px] gap-2">
                          <input
                            autoFocus
                            value={editSubData.name}
                            onChange={e => setEditSubData(p => ({ ...p, name: e.target.value }))}
                            className="border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <input
                            type="number"
                            value={editSubData.budgetAmount}
                            onChange={e =>
                              setEditSubData(p => ({ ...p, budgetAmount: e.target.value }))
                            }
                            className="border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder={content.categories.manager.subcategoryAmountEditPlaceholder}
                          />
                          <select
                            value={editSubData.managerId}
                            onChange={e =>
                              setEditSubData(p => ({ ...p, managerId: e.target.value }))
                            }
                            className="border rounded-lg px-2.5 py-1.5 text-sm bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="">{content.common.labels.unassigned}</option>
                            {members.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.name?.trim() || member.email}
                              </option>
                            ))}
                          </select>
                          <input
                            value={editSubData.note}
                            onChange={e => setEditSubData(p => ({ ...p, note: e.target.value }))}
                            className="md:col-span-3 border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder={content.categories.manager.subcategoryNotePlaceholder}
                          />
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          <button
                            onClick={() => saveEditSub(sub.id, cat.id)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditSubId(null)}
                            className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{sub.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                              {getMemberLabel(sub.managerId)}
                            </span>
                            {sub.note ? (
                              <span className="text-muted-foreground">
                                {content.common.labels.notePrefix} {sub.note}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/70">
                                {content.common.labels.noNote}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="sm:w-28 text-left sm:text-right">
                          <p className="text-sm font-medium text-foreground">
                            {formatINR(sub.budgetAmount)}
                            <span className="text-muted-foreground font-normal text-xs">
                              {content.common.monthSuffix}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatINR(sub.budgetAmount * 12)}
                            {content.common.yearSuffix}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setEditSubId(sub.id)
                              setEditSubData({
                                name: sub.name,
                                budgetAmount: String(sub.budgetAmount),
                                managerId: sub.managerId ?? '',
                                note: sub.note ?? '',
                              })
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSubCategory(sub.id, cat.id)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add subcategory row */}
                <div className="px-4 sm:px-10 py-3 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_180px_auto] gap-2">
                    <input
                      value={newSubName[cat.id] ?? ''}
                      onChange={e => setNewSubName(p => ({ ...p, [cat.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addSubCategory(cat.id) }}
                      placeholder={content.categories.manager.subcategoryNamePlaceholder}
                      className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="number"
                      value={newSubAmount[cat.id] ?? ''}
                      onChange={e => setNewSubAmount(p => ({ ...p, [cat.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addSubCategory(cat.id) }}
                      placeholder={content.categories.manager.subcategoryAmountPlaceholder}
                      className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <select
                      value={newSubManagerId[cat.id] ?? ''}
                      onChange={e => setNewSubManagerId(p => ({ ...p, [cat.id]: e.target.value }))}
                      className="border rounded-lg px-3 py-1.5 text-sm bg-card focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">{content.common.labels.unassigned}</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name?.trim() || member.email}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => addSubCategory(cat.id)}
                      disabled={!newSubName[cat.id]?.trim()}
                      className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition w-full md:w-auto"
                    >
                      <Plus className="w-3 h-3" />
                      {content.common.buttons.add}
                    </button>
                  </div>
                  <input
                    value={newSubNote[cat.id] ?? ''}
                    onChange={e => setNewSubNote(p => ({ ...p, [cat.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') addSubCategory(cat.id) }}
                    placeholder={content.categories.manager.subcategoryNotePlaceholder}
                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* New category form */}
      {showNewCat ? (
        <div className="bg-card rounded-2xl border p-4 sm:p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">{content.categories.manager.newCategoryTitle}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              autoFocus
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCategory() }}
              placeholder={content.categories.manager.newCategoryPlaceholder}
              className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {/* Color picker */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewCatColor(c)}
                  title={c}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newCatColor === c ? 'border-foreground scale-125' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { setShowNewCat(false); setNewCatName(''); setNewCatColor(CATEGORY_COLORS[0]) }}
              className="px-4 py-2 border rounded-lg text-sm text-muted-foreground hover:bg-muted w-full sm:w-auto"
            >
              {content.common.buttons.cancel}
            </button>
            <button
              onClick={addCategory}
              disabled={!newCatName.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 w-full sm:w-auto"
            >
              {content.categories.manager.addCategory}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNewCat(true)}
          className="w-full border-2 border-dashed rounded-2xl py-4 text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {content.categories.manager.addCategory}
        </button>
      )}
    </div>
  )
}
