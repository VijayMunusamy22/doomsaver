import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatINR(amount: number) {
  return INR_FORMATTER.format(Number.isFinite(amount) ? amount : 0)
}

export const CATEGORY_COLORS = [
  '#C9922B',
  '#E8B84B',
  '#1A1B22',
  '#0B0C0F',
  '#F2EDE4',
]

function randomUppercase(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function randomDigits(length: number) {
  const chars = '0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function generateInviteCode() {
  return `FAM-${randomUppercase(2)}${randomDigits(4)}`
}
