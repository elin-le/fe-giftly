import { useMemo } from 'react'
import { productsApi } from '@/features/products/api/productsApi'
import { useAsync } from '@/lib/useAsync'
import { splitCatalog } from '../catalog'

/** Tải sản phẩm một lần rồi tách thành các nhóm thành phần của hộp quà. */
export function useBuilderCatalog() {
  const products = useAsync(() => productsApi.list(), [])
  const catalog = useMemo(() => splitCatalog(products.data ?? []), [products.data])

  return { ...catalog, isLoading: products.isLoading, error: products.error, reload: products.reload }
}
