'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { CATEGORY_COLORS, formatINR } from '@/lib/utils'
import type { Category, SubCategory, User } from '@prisma/client'
import { content } from '@/lib/content'

type CategoryWithSubs = Category & { subCategories: SubCategory[] }
type Member = Pick<User, 'id' | 'name' | 'email'>

interface Props {
  categories: CategoryWithSubs[]
  members: Member[]
}

interface CategoryMeta {
  id: string
  name: string
  color: string
}

type MemberRow = {
  member: string
  total: number
  [key: string]: string | number
}

interface TooltipItem {
  name: string
  value: number
  color: string
}

function MemberCategoryTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload as Record<string, string | number>
  const total = Number(row.total ?? 0)
  const items: TooltipItem[] = payload
    .map((entry: any) => ({
      name: entry.name as string,
      value: Number(entry.value ?? 0),
      color: entry.color as string,
    }))
    .filter((item: TooltipItem) => item.value > 0)
    .sort((a: TooltipItem, b: TooltipItem) => b.value - a.value)

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-sm min-w-[220px]">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {content.dashboard.memberCategoryChart.noCategoryAllocations}
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item: TooltipItem) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="text-foreground">
                {formatINR(item.value)}{' '}
                <span className="text-muted-foreground/80">
                  ({total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%)
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 border-t pt-1.5 text-xs text-muted-foreground">
        {content.dashboard.memberCategoryChart.totalLabel}: {formatINR(total)}
      </p>
    </div>
  )
}

export function MemberCategoryExpenseChart({ categories, members }: Props) {
  const categoryMeta: CategoryMeta[] = categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    color: category.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))

  const rowsByMember = new Map<string, MemberRow>()

  const makeEmptyRow = (memberLabel: string): MemberRow => {
    const row: MemberRow = { member: memberLabel, total: 0 }
    categoryMeta.forEach(category => {
      row[category.id] = 0
    })
    return row
  }

  const upsertRow = (memberId: string, memberLabel: string) => {
    if (!rowsByMember.has(memberId)) {
      rowsByMember.set(memberId, makeEmptyRow(memberLabel))
    }
    return rowsByMember.get(memberId)!
  }

  members.forEach(member => {
    upsertRow(member.id, member.name?.trim() || member.email)
  })

  categories.forEach(category => {
    category.subCategories.forEach(sub => {
      if (sub.budgetAmount <= 0) return
      const memberId = sub.managerId && rowsByMember.has(sub.managerId) ? sub.managerId : '__unassigned__'
      const row = upsertRow(memberId, content.dashboard.memberCategoryChart.unassigned)
      row[category.id] = Number(row[category.id] ?? 0) + sub.budgetAmount
      row.total += sub.budgetAmount
    })
  })

  const rows = Array.from(rowsByMember.values())
    .filter(row => Number(row.total) > 0)
    .sort((a, b) => Number(b.total) - Number(a.total))

  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center h-72 gap-2">
        <p className="text-muted-foreground text-sm">
          {content.dashboard.memberCategoryChart.emptyTitle}
        </p>
        <p className="text-xs text-muted-foreground/70">
          {content.dashboard.memberCategoryChart.emptySubtitle}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border p-6">
      <h3 className="font-semibold text-foreground mb-1">
        {content.dashboard.memberCategoryChart.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        {content.dashboard.memberCategoryChart.subtitle}
      </p>
      <ResponsiveContainer width="100%" height={Math.max(300, rows.length * 60)}>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={v => `₹${(Number(v) / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11 }}
          />
          <YAxis type="category" dataKey="member" width={130} tick={{ fontSize: 11 }} />
          <Tooltip content={<MemberCategoryTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {categoryMeta.map(category => (
            <Bar
              key={category.id}
              dataKey={category.id}
              stackId="member-expense"
              name={category.name}
              fill={category.color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
