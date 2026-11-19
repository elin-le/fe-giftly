import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { toApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { selectIsAuthenticated, useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { authApi } from '../api/authApi'
import { registerSchema, type RegisterFormValues, type RegisterValues } from '../authSchemas'
import { AuthCard } from '../components/AuthCard'
import { PasswordInput } from '../components/PasswordInput'
import { useAuthDestination } from '../hooks/useAuthDestination'

const EMPTY_VALUES: RegisterFormValues = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }

export function RegisterPage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const setSession = useAuthStore((state) => state.setSession)
  const showToast = useToastStore((state) => state.show)
  const { destination, reason } = useAuthDestination()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues, unknown, RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: EMPTY_VALUES,
  })

  const submit = handleSubmit(async ({ fullName, email, phone, password }) => {
    setFormError(null)
    try {
      const session = await authApi.register({ fullName, email, password, phone: phone || undefined })
      setSession(session)
      showToast(`Chào mừng ${session.user.fullName} đến với Giftly!`, 'success')
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  })

  if (isAuthenticated) return <Navigate to={destination} replace />

  return (
    <AuthCard
      title="Tạo tài khoản"
      description="Đăng ký để lưu giỏ hàng, đặt quà và theo dõi đơn hàng."
      reason={reason}
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/signin" state={{ from: destination }} className="font-semibold text-foreground underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <FormField id="fullName" label="Họ và tên" required error={errors.fullName?.message}>
          <Input id="fullName" autoComplete="name" {...register('fullName')} />
        </FormField>
        <FormField id="email" label="Email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>
        <FormField id="phone" label="Số điện thoại (không bắt buộc)" error={errors.phone?.message}>
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
        </FormField>
        <FormField id="password" label="Mật khẩu" required error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
        </FormField>
        <FormField id="confirmPassword" label="Nhập lại mật khẩu" required error={errors.confirmPassword?.message}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" {...register('confirmPassword')} />
        </FormField>

        {formError && (
          <p role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
        </Button>
      </form>
    </AuthCard>
  )
}
