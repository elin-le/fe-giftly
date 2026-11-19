import { z } from 'zod'
import { optionalPhoneSchema } from '@/lib/phone'

/** BCrypt chỉ xử lý tối đa 72 byte đầu của mật khẩu. */
const PASSWORD_MAX_LENGTH = 72

const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Email không hợp lệ'))

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên').max(80, 'Họ tên quá dài'),
    email: emailSchema,
    phone: optionalPhoneSchema,
    password: z
      .string()
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .max(PASSWORD_MAX_LENGTH, `Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự`)
      .regex(/[A-Za-z]/, 'Mật khẩu cần có ít nhất một chữ cái')
      .regex(/\d/, 'Mật khẩu cần có ít nhất một chữ số'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })

export type SignInFormValues = z.input<typeof signInSchema>
export type SignInValues = z.output<typeof signInSchema>
export type RegisterFormValues = z.input<typeof registerSchema>
export type RegisterValues = z.output<typeof registerSchema>
