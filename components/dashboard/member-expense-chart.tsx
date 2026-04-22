'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatINR, CATEGORY_COLORS } from '@/lib/utils'
import type { Category, SubCategory, User } from '@prisma/client'
import { content } from '@/lib/content'

type CategoryWithSubs = Category & { subCategories: SubCategory[] }
type Member = Pick<User, 'id' | 'name' | 'email'>

interface Props {
  categories: CategoryWithSubs[]
  members: Member[]
}

interface MemberExpenseDatum {
  name: string
  value: number
  color: string
  percent: number
}

function MemberExpenseTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as MemberExpenseDatum

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs font-semibold text-foreground">{point.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatINR(point.value)}{' '}
        <span className="text-muted-foreground/80">({point.percent.toFixed(1)}%)</span>
      </p>
    </div>
  )
}

export function MemberExpenseChart({ categories, members }: Props) {
  const memberTotals = new Map<string, { name: string; value: number; color: string }>()

  members.forEach((member, index) => {
    memberTotals.set(member.id, {
      name: member.name?.trim() || member.email,
      value: 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })
  })

  let unassigned = 0
  categories.forEach(category => {
    category.subCategories.forEach(sub => {
      if (sub.budgetAmount <= 0) return
      if (sub.managerId && memberTotals.has(sub.managerId)) {
        memberTotals.get(sub.managerId)!.value += sub.budgetAmount
      } else {
        unassigned += sub.budgetAmount
      }
    })
  })

  const baseData = Array.from(memberTotals.values()).filter(item => item.value > 0)
  if (unassigned > 0) {
    baseData.push({
      name: content.dashboard.memberExpenseChart.unassigned,
      value: unassigned,
      color: '#E8B84B',
    })
  }

  if (baseData.length === 0) {
    return (
      <div className="bg-card rounded-2xl border p-6 flex flex-col items-center justify-center h-72 gap-2">
        <p className="text-muted-foreground text-sm">{content.dashboard.memberExpenseChart.emptyTitle}</p>
        <p className="text-xs text-muted-foreground/70">
          {content.dashboard.memberExpenseChart.emptySubtitle}
        </p>
      </div>
    )
  }

  const total = baseData.reduce((sum, item) => sum + item.value, 0)
  const data: MemberExpenseDatum[] = baseData.map(item => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }))

  return (
    <div className="bg-card rounded-2xl border p-6 min-h-[360px] flex flex-col">
      <h3 className="font-semibold text-foreground mb-1">
        {content.dashboard.memberExpenseChart.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {content.dashboard.memberExpenseChart.subtitle}
      </p>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<MemberExpenseTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">
              {item.name} ({item.percent.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
