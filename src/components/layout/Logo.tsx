import { Gift } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="Giftly — trang chủ">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
        <Gift className="size-4" />
      </span>
      Giftly
    </Link>
  )
}
