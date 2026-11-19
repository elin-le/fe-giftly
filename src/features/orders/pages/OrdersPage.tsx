import { PackageOpen } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAsync } from '@/lib/useAsync'
import { ordersApi } from '../api/ordersApi'
import { OrderCard } from '../components/OrderCard'
import { ReviewDialog, type ReviewTarget } from '../components/ReviewDialog'
import { reviewsApi } from '../api/reviewsApi'
import type { Review } from '../types'

export function OrdersPage() {
  const orders = useAsync(() => ordersApi.listMine(), [])
  const myReviews = useAsync(() => reviewsApi.mine(), [])
  const [created, setCreated] = useState<Review[]>([])
  const [target, setTarget] = useState<ReviewTarget | null>(null)
  const reviews = [...(myReviews.data ?? []), ...created]

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">Đơn hàng của tôi</h1>
        <p className="text-muted-foreground">Theo dõi trạng thái xử lý các đơn quà bạn đã đặt.</p>
      </header>

      <OrdersContent
        isLoading={orders.isLoading}
        error={orders.error}
        orders={orders.data ?? []}
        onRetry={orders.reload}
        reviews={reviews}
        onReview={setTarget}
      />

      <ReviewDialog target={target} onClose={() => setTarget(null)} onCreated={(review) => setCreated((list) => [...list, review])} />
    </section>
  )
}

interface OrdersContentProps {
  isLoading: boolean
  error: string | null
  orders: Parameters<typeof OrderCard>[0]['order'][]
  reviews: Review[]
  onReview: (target: ReviewTarget) => void
  onRetry: () => void
}

function OrdersContent({ isLoading, error, orders, reviews, onReview, onRetry }: OrdersContentProps) {
  if (error) {
    return (
      <div role="alert" className="grid place-items-center gap-3 rounded-card border border-danger/40 p-10 text-center">
        <p className="text-danger">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải đơn hàng">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-card bg-surface-raised" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="grid place-items-center gap-4 py-20 text-center text-muted-foreground">
        <PackageOpen className="size-10" strokeWidth={1.25} />
        <p>Bạn chưa có đơn hàng nào.</p>
        <Button asChild>
          <Link to="/products">Chọn quà ngay</Link>
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {orders.map((order) => (
        <motion.div
          key={order.id}
          variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <OrderCard order={order} reviews={reviews} onReview={onReview} />
        </motion.div>
      ))}
    </motion.div>
  )
}
