import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Gộp class Tailwind, tự loại bỏ class xung đột. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
