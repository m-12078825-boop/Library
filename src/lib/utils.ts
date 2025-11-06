import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function generateStudentId(schoolCode: string, classCode: string, rollNo: number): string {
  const year = new Date().getFullYear()
  return `${schoolCode}${year}${classCode}${rollNo.toString().padStart(3, '0')}`
}

export function generateBarcode(): string {
  return Math.random().toString(36).substring(2, 15).toUpperCase()
}

export function calculateFine(dueDate: Date, returnDate: Date = new Date()): number {
  const daysLate = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  const gracePeriod = 2
  const finePerDay = 0.50
  const maxFine = 10.00

  if (daysLate <= gracePeriod) return 0

  const fine = (daysLate - gracePeriod) * finePerDay
  return Math.min(fine, maxFine)
}