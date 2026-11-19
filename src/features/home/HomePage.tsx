import { ArrowRight, Gift, PackagePlus, PenLine, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ContactLinks } from '@/components/layout/ContactLinks'
import { Button } from '@/components/ui/button'
import { useAuthGate } from '@/features/auth/hooks/useAuthGate'
import { useCartActions } from '@/features/cart/hooks/useCartActions'
import { useCategories, useFeaturedProducts } from '@/features/products/hooks/useProducts'
import type { Product } from '@/features/products/types'
import { CategoryShowcase } from './components/CategoryShowcase'
import { HomeHero } from './components/HomeHero'
import { HotProducts } from './components/HotProducts'

const HIGHLIGHTS = [
  { icon: Gift, title: 'Hộp quà theo dịp', text: 'Sinh nhật, tốt nghiệp, kỷ niệm — chọn là có.', tone: 'bg-rose-soft' },
  { icon: PenLine, title: 'Lời chúc viết tay', text: 'Thêm thiệp và lời nhắn riêng cho người nhận.', tone: 'bg-mint-soft' },
  { icon: Sparkles, title: 'Đặt hàng đơn giản', text: 'Từ giỏ hàng tới xác nhận chỉ vài bước.', tone: 'bg-lilac-soft' },
]

const EASE = [0.22, 1, 0.36, 1] as const

export function HomePage() {
  const categories = useCategories()
  const featured = useFeaturedProducts(8)
  const requireAuth = useAuthGate()
  const { addVariant } = useCartActions()

  const handleQuickAdd = (product: Product) => {
    const [variant] = product.variants
    if (variant) requireAuth('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', () => void addVariant(variant.id, product.name))
  }

  return (
    <div className="flex flex-col gap-14">
      <HomeHero />
      <CategoryShowcase categories={categories.data ?? []} isLoading={categories.isLoading} />
      <HotProducts products={featured.data ?? []} isLoading={featured.isLoading} error={featured.error} onQuickAdd={handleQuickAdd} onRetry={featured.reload} />

      <section className="grid gap-5 md:grid-cols-3" aria-label="Điểm nổi bật">
        {HIGHLIGHTS.map(({ icon: Icon, title, text, tone }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: EASE }}
            className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6"
          >
            <span className={`grid size-11 place-items-center rounded-full text-foreground ${tone}`}>
              <Icon className="size-5" />
            </span>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{text}</p>
          </motion.div>
        ))}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative flex flex-col gap-5 overflow-hidden rounded-[2.5rem] bg-accent-soft p-8 text-accent-foreground md:flex-row md:items-center md:justify-between md:p-12"
      >
        <div aria-hidden className="bg-aurora absolute inset-0 opacity-60" />
        <div className="relative flex max-w-xl flex-col gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
            <PackagePlus className="size-5" />
          </span>
          <h2 className="text-2xl font-bold md:text-3xl">Tự thiết kế hộp quà của riêng bạn</h2>
          <p className="opacity-80">Chọn hộp, chọn từng món, viết lời chúc — xem tổng giá ngay khi thiết kế.</p>
        </div>
        <Button asChild size="lg" className="relative">
          <Link to="/builder">
            Bắt đầu thiết kế <ArrowRight />
          </Link>
        </Button>
      </motion.section>

      <section className="flex flex-col items-center gap-3 text-center" aria-label="Liên hệ">
        <h2 className="text-xl font-bold">Cần tư vấn quà tặng?</h2>
        <p className="text-sm text-muted-foreground">Nhắn trực tiếp cho người bán qua Zalo hoặc Facebook.</p>
        <ContactLinks className="justify-center" />
      </section>
    </div>
  )
}
