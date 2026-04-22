'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatINR } from '@/lib/utils'
import type { Income, User } from '@prisma/client'
import { content } from '@/lib/content'

const COLORS = ['#C9922B', '#E8B84B', '#1A1B22', '#0B0C0F', '#F2EDE4']

interface Props {
  incomes: Array<
    Income & {
      user: Pick<User, 'id' | 'name' | 'email'>
    }
  >
}

export function IncomeChart({ incomes }: Props) {
  const groupedBase = Object.values(
    incomes.reduce<Record<string, { name: string; value: number }>>((acc, inc) => {
      const memberKey = inc.user.id
      if (!acc[memberKey]) {
        acc[memberKey] = {
          name: inc.user.name?.trim() || inc.user.email,
          value: 0,
        }
      }
      acc[memberKey].value += inc.amount
      return acc
    }, {}),
  )
  const total = groupedBase.reduce((sum, item) => sum + item.value, 0)
  const grouped = groupedBase.map(item => ({
    ...item,
    percent: total > 0 ? (item.value / total) * 100 : 0,
  }))

  if (grouped.length === 0) {
    return (
      <div className="bg-card rounded-2xl border p-4 sm:p-6 flex flex-col items-center justify-center h-72 gap-2">
        <p className="text-muted-foreground text-sm">{content.dashboard.incomeChart.emptyTitle}</p>
        <p className="text-xs text-muted-foreground/70">
          {content.dashboard.incomeChart.emptySubtitle}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border p-4 sm:p-6 min-h-[340px] sm:min-h-[360px] flex flex-col">
      <h3 className="font-semibold text-foreground mb-1">{content.dashboard.incomeChart.title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{content.dashboard.incomeChart.subtitle}</p>
      <div className="h-[220px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={grouped}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {grouped.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _: string, item: any) => {
                const point = item?.payload as { percent?: number } | undefined
                const pct = point?.percent ?? 0
                return [`${formatINR(value)} (${pct.toFixed(1)}%)`, '']
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {grouped.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
