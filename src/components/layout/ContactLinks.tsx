import { MessageCircle, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SHOP_CONTACT } from '@/lib/shopContact'

const ITEMS = [
  { key: 'zalo', icon: MessageCircle, label: `Zalo ${SHOP_CONTACT.zaloPhone}`, href: SHOP_CONTACT.zaloUrl, tone: 'bg-lilac-soft text-foreground' },
  { key: 'facebook', icon: Users, label: `Facebook ${SHOP_CONTACT.facebookUsername}`, href: SHOP_CONTACT.facebookUrl, tone: 'bg-mint-soft text-foreground' },
] as const

/** Hai kênh liên hệ trực tiếp với người bán; mở tab mới. */
export function ContactLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-3', className)} aria-label="Liên hệ người bán">
      {ITEMS.map(({ key, icon: Icon, label, href, tone }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 hover:shadow-soft', tone)}
          >
            <Icon className="size-4" /> {label}
          </a>
        </li>
      ))}
    </ul>
  )
}
