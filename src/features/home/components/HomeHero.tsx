import { ArrowRight, Gift, Heart, Sparkles, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const EASE = [0.22, 1, 0.36, 1] as const
const FLOATERS = [
  { icon: Gift, className: 'right-[12%] top-[14%] bg-rose text-foreground', delay: 0 },
  { icon: Heart, className: 'right-[34%] bottom-[12%] bg-mint text-foreground', delay: 1.2 },
  { icon: Star, className: 'right-[6%] bottom-[26%] bg-lilac text-foreground', delay: 2.4 },
]

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-14 text-primary-foreground md:px-14 md:py-24">
      <div aria-hidden className="bg-aurora absolute inset-0 opacity-70" />
      <motion.div
        aria-hidden
        className="absolute -right-16 -top-16 size-64 rounded-full bg-accent/90 md:size-96"
        animate={{ y: [0, 18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {FLOATERS.map(({ icon: Icon, className, delay }) => (
        <motion.span
          key={className}
          aria-hidden
          className={`absolute hidden size-14 place-items-center rounded-2xl shadow-pop md:grid ${className}`}
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          <Icon className="size-6" />
        </motion.span>
      ))}
      <div className="relative flex max-w-xl flex-col gap-6">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
          <Sparkles className="size-4" /> Giftly · Quà tặng cá nhân hóa
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: EASE }} className="text-4xl font-bold leading-tight md:text-6xl">
          Mỗi món quà là một câu chuyện riêng.
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="opacity-85">
          Chọn hộp quà thiết kế sẵn hoặc tự tay kết hợp từng món — Giftly lo phần còn lại.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45, ease: EASE }} className="flex flex-wrap gap-3">
          <Button asChild variant="accent" size="lg">
            <Link to="/products">
              Khám phá cửa hàng <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/builder">Tự thiết kế hộp quà</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
