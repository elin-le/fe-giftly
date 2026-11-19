import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

export const TOAST_DURATION_MS = 3500
const MAX_VISIBLE_TOASTS = 3

interface ToastState {
  toasts: Toast[]
  show: (message: string, tone?: ToastTone) => void
  dismiss: (id: number) => void
}

let nextId = 1

/** Thông báo ngắn dùng chung; tự biến mất sau `TOAST_DURATION_MS`. */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  show: (message, tone = 'info') => {
    const id = nextId++
    set(({ toasts }) => ({ toasts: [...toasts, { id, message, tone }].slice(-MAX_VISIBLE_TOASTS) }))
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS)
  },

  dismiss: (id) => set(({ toasts }) => ({ toasts: toasts.filter((toast) => toast.id !== id) })),
}))
