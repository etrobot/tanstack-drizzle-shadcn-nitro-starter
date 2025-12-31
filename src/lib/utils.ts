import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateText(text: string, maxLength: number): string {
  if (typeof text !== 'string') return ''
  if (text.length <= maxLength) return text
  // avoid cutting in the middle of a word if possible
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > maxLength - 50 ? truncated.slice(0, lastSpace) + '…' : truncated + '…'
}
