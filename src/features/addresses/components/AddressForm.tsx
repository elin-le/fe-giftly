import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toApiError } from '@/api/errors'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { addressesApi } from '../api/addressesApi'
import { addressSchema, toAddressInput, type AddressFormOutput, type AddressFormValues } from '../addressSchema'
import type { Address } from '../types'

interface AddressFormProps {
  /** Địa chỉ đầu tiên của người dùng luôn là mặc định. */
  isFirstAddress: boolean
  onCreated: (address: Address) => void
  onCancel?: () => void
}

export function AddressForm({ isFirstAddress, onCreated, onCancel }: AddressFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues, unknown, AddressFormOutput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { recipientName: '', phone: '', addressLine: '', ward: '', district: '', city: '', isDefault: isFirstAddress },
  })

  const submit = async (values: AddressFormOutput) => {
    setServerError(null)
    try {
      onCreated(await addressesApi.create(toAddressInput(values)))
    } catch (error) {
      setServerError(toApiError(error).message)
    }
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(submit)(event)} aria-label="Thêm địa chỉ mới" className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="recipientName" label="Người nhận" required error={errors.recipientName?.message}>
          <Input id="recipientName" autoComplete="name" {...register('recipientName')} />
        </FormField>
        <FormField id="phone" label="Số điện thoại" required error={errors.phone?.message}>
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
        </FormField>
      </div>
      <FormField id="addressLine" label="Số nhà, tên đường" required error={errors.addressLine?.message}>
        <Input id="addressLine" autoComplete="street-address" {...register('addressLine')} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="ward" label="Phường/xã" error={errors.ward?.message}>
          <Input id="ward" {...register('ward')} />
        </FormField>
        <FormField id="district" label="Quận/huyện" error={errors.district?.message}>
          <Input id="district" {...register('district')} />
        </FormField>
        <FormField id="city" label="Tỉnh/thành phố" error={errors.city?.message}>
          <Input id="city" autoComplete="address-level1" {...register('city')} />
        </FormField>
      </div>
      {!isFirstAddress && (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-primary" {...register('isDefault')} /> Đặt làm địa chỉ mặc định
        </label>
      )}
      {serverError && (
        <p role="alert" className="rounded-2xl bg-danger/10 p-3 text-sm text-danger">
          {serverError}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Huỷ
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu…' : 'Lưu địa chỉ'}
        </Button>
      </div>
    </form>
  )
}
