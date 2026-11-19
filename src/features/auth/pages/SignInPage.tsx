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
import { signInSchema, type SignInFormValues, type SignInValues } from '../authSchemas'
import { AuthCard } from '../components/AuthCard'
import { DemoAccountsHint } from '../components/DemoAccountsHint'
import { PasswordInput } from '../components/PasswordInput'
import { useAuthDestination } from '../hooks/useAuthDestination'

export function SignInPage() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const setSession = useAuthStore((state) => state.setSession)
  const showToast = useToastStore((state) => state.show)
  const { destination, reason } = useAuthDestination()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues, unknown, SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const session = await authApi.signIn(values)
      setSession(session)
      showToast(`Xin chào, ${session.user.fullName}!`, 'success')
    } catch (error) {
      setFormError(toApiError(error).message)
    }
  })

  // Đã đăng nhập (kể cả vừa đăng nhập xong) thì đưa tới đích.
  if (isAuthenticated) return <Navigate to={destination} replace />

  return (
    <AuthCard
      title="Đăng nhập"
      description="Chào mừng bạn quay lại Giftly."
      reason={reason}
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/register" state={{ from: destination }} className="font-semibold text-foreground underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <FormField id="email" label="Email" required error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </FormField>
        <FormField id="password" label="Mật khẩu" required error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" {...register('password')} />
        </FormField>

        {formError && (
          <p role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
      </form>
      <DemoAccountsHint />
    </AuthCard>
  )
}
