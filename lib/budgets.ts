export const MASTER_PERIOD_KEY = 'MASTER'

export function toPeriodKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getCurrentPeriodKey(now = new Date()) {
  return toPeriodKey(now)
}

export function getNextPeriodKey(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return toPeriodKey(next)
}

export function getAllowedTargetPeriodKeys(now = new Date()) {
  return [getCurrentPeriodKey(now), getNextPeriodKey(now)]
}

export function isMonthlyPeriodKey(periodKey: string) {
  return /^\d{4}-\d{2}$/.test(periodKey)
}

export function formatPeriodLabel(periodKey: string) {
  if (periodKey === MASTER_PERIOD_KEY) return 'Master Budget'
  if (!isMonthlyPeriodKey(periodKey)) return periodKey

  const [year, month] = periodKey.split('-').map(Number)
  if (!year || !month) return periodKey

  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function getBudgetDisplayName(budget: { name: string; periodKey: string }) {
  if (budget.periodKey === MASTER_PERIOD_KEY) return budget.name || 'Master Budget'
  return formatPeriodLabel(budget.periodKey)
}

export function getMonthlyBudgetName(periodKey: string) {
  return `${formatPeriodLabel(periodKey)} Budget`
}
