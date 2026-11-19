import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ForbiddenPage() {
  return (
    <section className="grid min-h-dvh place-items-center px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <ShieldAlert className="size-12 text-danger" strokeWidth={1.25} />
        <h1 className="text-2xl font-bold">Bạn không có quyền truy cập</h1>
        <p className="text-muted-foreground">Khu vực này chỉ dành cho quản trị viên của Giftly.</p>
        <Button asChild>
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    </section>
  )
}
