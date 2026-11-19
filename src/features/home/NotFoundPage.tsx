import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <section className="grid place-items-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-accent">404</p>
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="text-muted-foreground">Trang bạn tìm có thể đã được di chuyển hoặc không tồn tại.</p>
      <Button asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </section>
  )
}
