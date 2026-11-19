import { CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Order } from '@/features/orders/types'
import { formatCurrency } from '@/lib/format'

export function OrderSuccess({ order }: { order: Order }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto grid max-w-md place-items-center gap-4 py-16 text-center"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
      >
        <CheckCircle2 className="size-16 text-success" strokeWidth={1.25} />
      </motion.span>
      <h1 className="text-3xl font-bold">Đặt hàng thành công!</h1>
      <p className="text-muted-foreground">
        Mã đơn hàng của bạn là <strong className="text-foreground">{order.orderNumber}</strong>. Giftly sẽ liên hệ xác nhận sớm nhất.
      </p>
      {order.requiredAdvanceAmount !== null && (
        <p className="text-sm text-muted-foreground">
          Khoản đặt cọc cần thanh toán: <strong className="text-foreground">{formatCurrency(order.requiredAdvanceAmount)}</strong>
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/orders">Theo dõi đơn hàng</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    </motion.section>
  )
}
