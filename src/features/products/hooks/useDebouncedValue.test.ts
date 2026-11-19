import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('giữ giá trị cũ cho tới khi hết thời gian chờ', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    })
    rerender({ v: 'ab' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('ab')
  })

  it('chỉ lấy giá trị cuối khi gõ liên tục', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: '' },
    })
    rerender({ v: 'n' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ v: 'nến' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('nến')
  })
})
