import { z } from 'zod'

/** Số điện thoại di động VN: 0xxxxxxxxx hoặc +84xxxxxxxxx (cho phép khoảng trắng, dấu chấm, gạch ngang). */
const PHONE_PATTERN = /^(0|\+84)\d{9}$/

const optionalText = (label: string) => z.string().trim().max(100, `${label} quá dài`)

export const addressSchema = z.object({
  recipientName: z.string().trim().min(2, 'Vui lòng nhập tên người nhận').max(80, 'Tên người nhận quá dài'),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s.-]/g, ''))
    .pipe(z.string().regex(PHONE_PATTERN, 'Số điện thoại không hợp lệ')),
  addressLine: z.string().trim().min(5, 'Vui lòng nhập địa chỉ đầy đủ').max(200, 'Địa chỉ quá dài'),
  ward: optionalText('Phường/xã'),
  district: optionalText('Quận/huyện'),
  city: optionalText('Tỉnh/thành phố'),
  isDefault: z.boolean(),
})

export type AddressFormValues = z.input<typeof addressSchema>
export type AddressFormOutput = z.output<typeof addressSchema>

/** Ô trống gửi lên là `null` (cột DB cho phép NULL). */
export const toAddressInput = (values: AddressFormOutput) => ({
  ...values,
  ward: values.ward || null,
  district: values.district || null,
  city: values.city || null,
})
