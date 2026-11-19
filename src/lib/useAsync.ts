import { useCallback, useEffect, useRef, useState } from 'react'

export interface AsyncState<T> {
  data: T | undefined
  error: string | null
  isLoading: boolean
  reload: () => void
}

/**
 * Gọi một hàm bất đồng bộ khi mount / khi `deps` đổi.
 * Bỏ qua kết quả của các lần gọi cũ để tránh race condition.
 */
export function useAsync<T>(fetcher: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [version, setVersion] = useState(0)
  const latestRequest = useRef(0)

  useEffect(() => {
    const requestId = ++latestRequest.current
    setIsLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (requestId === latestRequest.current) setData(result)
      })
      .catch((err: unknown) => {
        if (requestId === latestRequest.current) {
          setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
        }
      })
      .finally(() => {
        if (requestId === latestRequest.current) setIsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { data, error, isLoading, reload }
}
