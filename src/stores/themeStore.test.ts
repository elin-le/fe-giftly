import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => useThemeStore.getState().setMode('light'))

  it('toggle đổi qua lại giữa light và dark', () => {
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('dark')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('đồng bộ class "dark" lên <html>', () => {
    useThemeStore.getState().setMode('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    useThemeStore.getState().setMode('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('lưu lựa chọn vào localStorage', () => {
    useThemeStore.getState().setMode('dark')
    expect(localStorage.getItem('giftly-theme')).toContain('"dark"')
  })
})
