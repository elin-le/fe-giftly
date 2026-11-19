import { useState } from 'react'
import { toApiError } from '@/api/errors'
import type { Address } from '@/features/addresses/types'
import { useAddresses } from '@/features/addresses/hooks/useAddresses'
import { selectCartIsEmpty, useCartStore } from '@/features/cart/cartStore'
import { ordersApi } from '@/features/orders/api/ordersApi'
import type { Order, PaymentMethod } from '@/features/orders/types'

export type CheckoutStep = 'editing' | 'confirming' | 'submitting' | 'success'

/** Luồng: chọn địa chỉ + thanh toán → xác nhận → gửi đơn (server dùng giỏ hàng của người dùng) → thành công. */
export function useCheckout() {
  const cart = useCartStore((state) => state.cart)
  const isCartEmpty = useCartStore(selectCartIsEmpty)
  const addressList = useAddresses()

  const [created, setCreated] = useState<Address[]>([])
  const [pickedId, setPickedId] = useState<string | null>(null)
  const [chosenMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [step, setStep] = useState<CheckoutStep>('editing')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Đơn có đặt cọc không được COD (tránh bỏ qua khoản cọc): tự chuyển sang chuyển khoản.
  const requiresAdvance = (cart?.requiredAdvanceAmount ?? 0) > 0
  const paymentMethod: PaymentMethod = requiresAdvance && chosenMethod === 'COD' ? 'BANK_TRANSFER' : chosenMethod

  const addresses = [...(addressList.data ?? []).filter((a) => !created.some((c) => c.id === a.id)), ...created]
  const defaultId = addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? null
  // Địa chỉ người dùng chọn; nếu chưa chọn (hoặc đã biến mất) thì dùng địa chỉ mặc định.
  const addressId = addresses.some((a) => a.id === pickedId) ? pickedId : defaultId
  const address = addresses.find((a) => a.id === addressId) ?? null

  const addAddress = (next: Address) => {
    setCreated((list) => [...list, next])
    setPickedId(next.id)
  }

  const requestConfirmation = () => {
    if (!address || isCartEmpty) return
    setError(null)
    setStep('confirming')
  }

  const cancelConfirmation = () => {
    if (step !== 'submitting') setStep('editing')
  }

  const confirmOrder = async () => {
    if (!address || isCartEmpty || step === 'submitting') return
    setStep('submitting')
    setError(null)

    try {
      const placed = await ordersApi.create({ addressId: address.id, paymentMethod })
      setOrder(placed)
      setStep('success')
      void useCartStore.getState().load() // server đã làm rỗng giỏ
    } catch (err) {
      setError(toApiError(err).message)
      setStep('confirming')
    }
  }

  return {
    step, cart, isCartEmpty, order, error, requiresAdvance,
    addresses, address, addressesLoading: addressList.isLoading, addressesError: addressList.error, reloadAddresses: addressList.reload,
    paymentMethod, setPaymentMethod, selectAddress: setPickedId, addAddress,
    requestConfirmation, cancelConfirmation, confirmOrder,
  }
}
