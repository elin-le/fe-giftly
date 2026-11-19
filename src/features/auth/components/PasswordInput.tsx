import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes, type Ref } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/cn'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { ref?: Ref<HTMLInputElement> }

/** Ô nhập mật khẩu có nút hiện/ẩn. */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={isVisible ? 'text' : 'password'} className={cn('pr-12', className)} />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={isVisible}
        className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
      >
        {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
