import { cloneElement, type ReactElement } from 'react'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  /** Trường bắt buộc: hiện dấu * đỏ sau nhãn. */
  required?: boolean
  error?: string
  children: ReactElement<{ 'aria-invalid'?: boolean; 'aria-required'?: boolean; 'aria-describedby'?: string }>
}

/** Nhãn + ô nhập + thông báo lỗi, gắn sẵn thuộc tính truy cập (a11y). */
export function FormField({ id, label, required, error, children }: FormFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {cloneElement(children, {
        'aria-invalid': Boolean(error),
        'aria-required': required ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
