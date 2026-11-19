import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  linkTo?: string
  linkLabel?: string
}

export function SectionHeading({ title, subtitle, linkTo, linkLabel }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          {linkLabel ?? 'Xem tất cả'} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}
