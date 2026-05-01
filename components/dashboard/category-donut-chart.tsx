'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatINR, CATEGORY_COLORS } from '@/lib/utils'
import type { Category, SubCategory } from '@prisma/client'
import { content } from '@/lib/content'

type CategoryWithSubs = Category & { subCategories: SubCategory[] }

interface Props {
  categories: CategoryWithSubs[]
  totalIncome: number
}

function CategoryTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as {
    name: string
    value: number
    percent: number
  }

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

export function CategoryDonutChart({ categories, totalIncome }: Props) {
  const baseData = categories
    .map((cat, i) => ({
      name: cat.name,
      value: cat.subCategories.reduce((s, sub) => s + sub.budgetAmount, 0),
      color: cat.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    .filter(d => d.value > 0)

  const allocated = baseData.reduce((s, d) => s + d.value, 0)
  const unallocated = totalIncome - allocated

  if (unallocated > 0) {
    baseData.push({
      name: content.dashboard.categoryChart.unallocated,
      value: unallocated,
      color: '#E8B84B',
    })
  }

  if (baseData.length === 0) {
    return (
      <div className="glass-card p-4 sm:p-6 flex flex-col items-center justify-center h-72 gap-2">
        <p className="text-muted-foreground text-sm">{content.dashboard.categoryChart.emptyTitle}</p>
        <p className="text-xs text-muted-foreground/70">
          {content.dashboard.categoryChart.emptySubtitle}
        </p>
      </div>
    )
  }

  const total = baseData.reduce((s, d) => s + d.value, 0)
  const data = baseData.map(d => ({
    ...d,
    percent: total > 0 ? (d.value / total) * 100 : 0,
  }))

  return (
    <div className="glass-card p-4 sm:p-6 min-h-[340px] sm:min-h-[380px] flex flex-col">
      <h3 className="font-semibold text-foreground mb-1">{content.dashboard.categoryChart.title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{content.dashboard.categoryChart.subtitle}</p>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CategoryTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
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
