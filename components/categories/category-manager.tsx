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
import { CATEGORY_COLORS } from '@/lib/utils'
import { content } from '@/lib/content'

interface SubCategory {
  id: string
  name: string
  categoryId: string
}

interface Category {
  id: string
  name: string
  color: string
  subCategories: SubCategory[]
}

interface Props {
  initialCategories: Category[]
  budgetId: string
}

export function CategoryManager({ initialCategories, budgetId }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0])

  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')

  const [newSubName, setNewSubName] = useState<Record<string, string>>({})

  const [editSubId, setEditSubId] = useState<string | null>(null)
  const [editSubName, setEditSubName] = useState('')

  const totalSubcategories = categories.reduce((sum, category) => sum + category.subCategories.length, 0)

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const addCategory = async () => {
    if (!newCatName.trim()) return
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCatName.trim(),
        color: newCatColor,
        budgetId,
      }),
    })

    if (!res.ok) return

    const category = await res.json()
    setCategories(prev => [...prev, category])
    setNewCatName('')
    setNewCatColor(CATEGORY_COLORS[0])
    setShowNewCat(false)
    setExpanded(prev => {
      const next = new Set(prev)
      next.add(category.id)
      return next
    })
  }

  const saveEditCategory = async (id: string) => {
    const name = editCatName.trim()
    if (!name) return

    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) return

    setCategories(prev => prev.map(category => (category.id === id ? { ...category, name } : category)))
    setEditCatId(null)
  }

  const deleteCategory = async (id: string) => {
    if (!confirm(content.categories.manager.deleteCategoryConfirm)) return

    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) return

    setCategories(prev => prev.filter(category => category.id !== id))
  }

  const addSubCategory = async (categoryId: string) => {
    const name = (newSubName[categoryId] ?? '').trim()
    if (!name) return

    const res = await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, categoryId }),
    })

    if (!res.ok) return

    const sub = await res.json()
    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, subCategories: [...category.subCategories, sub] }
          : category,
      ),
    )
    setNewSubName(prev => ({ ...prev, [categoryId]: '' }))
  }

  const saveEditSubCategory = async (subId: string, categoryId: string) => {
    const name = editSubName.trim()
    if (!name) return

    const res = await fetch(`/api/subcategories/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) return

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: category.subCategories.map(sub =>
                sub.id === subId ? { ...sub, name } : sub,
              ),
            }
          : category,
      ),
    )
    setEditSubId(null)
  }

  const deleteSubCategory = async (subId: string, categoryId: string) => {
    const res = await fetch(`/api/subcategories/${subId}`, { method: 'DELETE' })
    if (!res.ok) return

    setCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: category.subCategories.filter(sub => sub.id !== subId),
            }
          : category,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground font-medium">
            {content.categories.manager.summaryTemplate}
          </p>
          <p className="text-lg sm:text-xl font-bold text-foreground">{categories.length}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-muted-foreground">{content.categories.manager.subcategoryCountLabel}</p>
          <p className="text-lg sm:text-xl font-semibold text-foreground">{totalSubcategories}</p>
        </div>
      </div>

      {categories.length === 0 && !showNewCat && (
        <div className="glass-card p-8 sm:p-12 text-center text-muted-foreground">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{content.categories.manager.emptyTitle}</p>
          <p className="text-xs mt-1 text-muted-foreground/70">
            {content.categories.manager.emptySubtitle}
          </p>
        </div>
      )}

      {categories.map(category => {
        const isOpen = expanded.has(category.id)

        return (
          <div key={category.id} className="glass-card overflow-hidden">
            <div className="flex items-center gap-3 px-3 sm:px-5 py-4">
              <button
                onClick={() => toggle(category.id)}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />

              {editCatId === category.id ? (
                <input
                  autoFocus
                  value={editCatName}
                  onChange={e => setEditCatName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveEditCategory(category.id)
                    if (e.key === 'Escape') setEditCatId(null)
                  }}
                  className="flex-1 border-b-2 border-primary outline-none text-sm font-semibold bg-transparent py-0.5"
                />
              ) : (
                <span className="flex-1 font-semibold text-foreground text-sm">{category.name}</span>
              )}

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground/70 hidden sm:block">
                  {category.subCategories.length} {content.categories.manager.itemCountSuffix}
                </span>
                {editCatId === category.id ? (
                  <>
                    <button
                      onClick={() => saveEditCategory(category.id)}
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
                      onClick={() => {
                        setEditCatId(category.id)
                        setEditCatName(category.name)
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="border-t bg-muted/60">
                {category.subCategories.length === 0 && (
                  <p className="px-4 sm:px-10 py-3 text-xs text-muted-foreground">
                    {content.categories.manager.subEmpty}
                  </p>
                )}

                {category.subCategories.map(sub => (
                  <div key={sub.id} className="px-4 sm:px-10 py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {editSubId === sub.id ? (
                        <input
                          autoFocus
                          value={editSubName}
                          onChange={e => setEditSubName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEditSubCategory(sub.id, category.id)
                            if (e.key === 'Escape') setEditSubId(null)
                          }}
                          className="flex-1 border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        <p className="text-sm text-foreground flex-1">{sub.name}</p>
                      )}

                      <div className="flex items-center gap-1">
                        {editSubId === sub.id ? (
                          <>
                            <button
                              onClick={() => saveEditSubCategory(sub.id, category.id)}
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
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditSubId(sub.id)
                                setEditSubName(sub.name)
                              }}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteSubCategory(sub.id, category.id)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="px-4 sm:px-10 py-3 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={newSubName[category.id] ?? ''}
                      onChange={e =>
                        setNewSubName(prev => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter') addSubCategory(category.id)
                      }}
                      placeholder={content.categories.manager.subcategoryNamePlaceholder}
                      className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => addSubCategory(category.id)}
                      disabled={!newSubName[category.id]?.trim()}
                      className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition w-full sm:w-auto"
                    >
                      <Plus className="w-3 h-3" />
                      {content.common.buttons.add}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {showNewCat ? (
        <div className="glass-card p-4 sm:p-5 space-y-4">
          <h3 className="font-semibold text-foreground text-sm">
            {content.categories.manager.newCategoryTitle}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              autoFocus
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addCategory()
              }}
              placeholder={content.categories.manager.newCategoryPlaceholder}
              className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewCatColor(color)}
                  title={color}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    newCatColor === color ? 'border-foreground scale-125' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setShowNewCat(false)
                setNewCatName('')
                setNewCatColor(CATEGORY_COLORS[0])
              }}
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
