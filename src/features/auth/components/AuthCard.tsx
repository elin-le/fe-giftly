import { Info } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description: string
  /** Lý do người dùng bị chuyển tới đây (vd. cần đăng nhập để thêm vào giỏ). */
  reason?: string
  footer: ReactNode
  children: ReactNode
}

/** Khung chung cho trang đăng nhập / đăng ký. */
export function AuthCard({ title, description, reason, footer, children }: AuthCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-[2rem] border border-border bg-surface p-6 shadow-soft sm:p-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      {reason && (
        <p role="status" className="flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-accent-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          {reason}
        </p>
      )}

      {children}

      <footer className="text-center text-sm text-muted-foreground">{footer}</footer>
    </motion.section>
  )
}
