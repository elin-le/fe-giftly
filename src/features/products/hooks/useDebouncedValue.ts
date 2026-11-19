import { useEffect, useState } from 'react'

/** Trả về `value` sau khi nó ngừng thay đổi trong `delayMs` mili-giây. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
