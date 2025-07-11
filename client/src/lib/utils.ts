import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function getDaysUntil(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getUrgencyColor(daysUntil: number): string {
  if (daysUntil < 0) return 'bg-red-100 text-red-800 border-red-200';
  if (daysUntil <= 3) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (daysUntil <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-green-100 text-green-800 border-green-200';
}

export function getUrgencyStatus(daysUntil: number): string {
  if (daysUntil < 0) return 'Overdue';
  if (daysUntil <= 3) return 'Due Soon';
  if (daysUntil <= 7) return 'Due This Week';
  return 'Active';
}

export function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 6) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length >= 3) {
    return cleaned.replace(/(\d{3})(\d{0,3})/, '($1) $2');
  }
  return cleaned;
}
