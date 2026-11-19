import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

/** Lấy giá trị mặc định theo cài đặt hệ điều hành của người dùng. */
function getSystemMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Gắn/gỡ class `dark` trên <html> để Tailwind đổi bộ token màu. */
export function applyThemeToDocument(mode: ThemeMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: getSystemMode(),
      toggle: () => set({ mode: get().mode === 'dark' ? 'light' : 'dark' }),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'giftly-theme',
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDocument(state.mode)
      },
    },
  ),
)

// Đồng bộ DOM mỗi khi mode thay đổi (kể cả lần khởi tạo đầu tiên)
useThemeStore.subscribe((state) => applyThemeToDocument(state.mode))
if (typeof document !== 'undefined') applyThemeToDocument(useThemeStore.getState().mode)
