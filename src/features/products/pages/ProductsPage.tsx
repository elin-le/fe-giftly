import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCartActions } from '@/features/cart/hooks/useCartActions'
import { useAuthGate } from '@/features/auth/hooks/useAuthGate'
import { ProductFilters } from '../components/ProductFilters'
import { ProductGrid } from '../components/ProductGrid'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useCategories, useProducts } from '../hooks/useProducts'
import { isVisibleInStore } from '../productRules'
import type { Product, ProductType } from '../types'

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [params, setParams] = useSearchParams()
  const categoryId = params.get('categoryId') ?? undefined
  const setCategoryId = (id: string | undefined) => setParams(id ? { categoryId: id } : {}, { replace: true })
  const [productType, setProductType] = useState<ProductType>()
  const debouncedSearch = useDebouncedValue(search)
  const requireAuth = useAuthGate()
  const { addVariant } = useCartActions()

  const categories = useCategories()
  const products = useProducts({ search: debouncedSearch, categoryId, productType })
  const visibleProducts = (products.data ?? []).filter(isVisibleInStore)

  // Thêm vào giỏ cần tài khoản vì giỏ hàng được lưu theo người dùng.
  const handleQuickAdd = (product: Product) => {
    const [variant] = product.variants
    if (variant) requireAuth('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', () => void addVariant(variant.id, product.name))
  }

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">Cửa hàng</h1>
        <p className="text-muted-foreground">Set quà thiết kế sẵn, hộp quà và những món quà lẻ cho từng dịp.</p>
      </header>

      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        categories={categories.data ?? []}
        activeCategoryId={categoryId}
        onCategoryChange={setCategoryId}
        activeType={productType}
        onTypeChange={setProductType}
      />

      <ProductGrid
        products={visibleProducts}
        isLoading={products.isLoading}
        error={products.error}
        onQuickAdd={handleQuickAdd}
        onRetry={products.reload}
      />
    </section>
  )
}
