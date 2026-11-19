import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, type Category, type ProductType } from '../types'

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  categories: Category[]
  activeCategoryId: string | undefined
  onCategoryChange: (categoryId: string | undefined) => void
  activeType: ProductType | undefined
  onTypeChange: (type: ProductType | undefined) => void
}

export function ProductFilters({
  search,
  onSearchChange,
  categories,
  activeCategoryId,
  onCategoryChange,
  activeType,
  onTypeChange,
}: ProductFiltersProps) {
  const chips = [{ id: undefined, name: 'Tất cả' }, ...categories]

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm hộp quà, nến thơm, thiệp…"
          aria-label="Tìm sản phẩm"
          className="pl-11"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="Danh mục">
        {chips.map((chip) => {
          const isActive = chip.id === activeCategoryId
          return (
            <button
              key={chip.id ?? 'all'}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(chip.id)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface hover:bg-surface-raised',
              )}
            >
              {chip.name}
            </button>
          )
        })}
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="Loại sản phẩm">
        {[undefined, ...PRODUCT_TYPES].map((type) => {
          const isActive = type === activeType
          return (
            <button
              key={type ?? 'all'}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTypeChange(type)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                isActive ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-surface hover:bg-surface-raised',
              )}
            >
              {type ? PRODUCT_TYPE_LABELS[type] : 'Mọi loại'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
