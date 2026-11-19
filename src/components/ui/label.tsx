import * as LabelPrimitive from '@radix-ui/react-label'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface LabelProps extends ComponentProps<typeof LabelPrimitive.Root> {
  /** Hiện dấu * đỏ sau nhãn. Vẽ bằng CSS để không lẫn vào nội dung chữ của nhãn (test/đọc màn hình theo tên nhãn). */
  required?: boolean
}

export function Label({ className, required, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn(
        'text-sm font-semibold text-foreground',
        required && "after:ml-0.5 after:font-bold after:text-danger after:content-['*']",
        className,
      )}
      {...props}
    />
  )
}
