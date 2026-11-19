import { Cake, Flower2, Gift, GraduationCap, Heart, Mail, Package, Ribbon, type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import type { Category } from '@/features/products/types'
import { cn } from '@/lib/cn'
import { SectionHeading } from './SectionHeading'

const TONES = ['bg-rose-soft', 'bg-mint-soft', 'bg-lilac-soft', 'bg-accent-soft'] as const
const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/sinh nhật/i, Cake],
  [/tốt nghiệp/i, GraduationCap],
  [/kỷ niệm/i, Heart],
  [/hộp/i, Package],
  [/ruy băng|giấy/i, Ribbon],
  [/thiệp/i, Mail],
  [/trà|ăn|bánh/i, Flower2],
]

export const getCategoryIcon = (name: string): LucideIcon => ICON_RULES.find(([rule]) => rule.test(name))?.[1] ?? Gift

interface CategoryShowcaseProps {
  categories: Category[]
  isLoading: boolean
}

/** Lưới danh mục: bấm vào mở cửa hàng đã lọc theo danh mục. */
export function CategoryShowcase({ categories, isLoading }: CategoryShowcaseProps) {
  return (
    <section className="flex flex-col gap-5" aria-label="Danh mục">
      <SectionHeading title="Mua theo danh mục" subtitle="Chọn dịp hoặc loại quà bạn đang tìm." linkTo="/products" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-card bg-surface-raised" />)
          : categories.map((category, index) => {
              const Icon = getCategoryIcon(category.name)
              return (
                <motion.div key={category.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} whileHover={{ y: -4, rotate: -1 }}>
                  <Link
                    to={`/products?categoryId=${category.id}`}
                    className={cn('flex h-28 flex-col justify-between rounded-card border border-border p-4 text-foreground shadow-soft transition-shadow hover:shadow-pop', TONES[index % TONES.length])}
                  >
                    <Icon className="size-7" strokeWidth={1.5} />
                    <span className="line-clamp-2 font-bold leading-tight">{category.name}</span>
                  </Link>
                </motion.div>
              )
            })}
      </div>
    </section>
  )
}
