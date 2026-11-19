import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toApiError } from '@/api/errors'
import { useAuthGate } from '@/features/auth/hooks/useAuthGate'
import { useCartStore } from '@/features/cart/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { giftBoxApi } from '../api/giftBoxApi'
import { useGiftBuilderStore } from '../giftBuilderStore'
import { toPayload } from '../giftBox'

/**
 * Lưu cấu hình hộp (`POST /gift-box-configs`) rồi thêm vào giỏ.
 * Chưa đăng nhập thì chuyển sang trang đăng nhập; bản nháp được giữ để quay lại làm tiếp.
 */
export function useAddGiftBoxToCart() {
  const navigate = useNavigate()
  const requireAuth = useAuthGate()
  const showToast = useToastStore((state) => state.show)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = () =>
    requireAuth('Vui lòng đăng nhập để thêm hộp quà vào giỏ hàng.', () => {
      const { draft, editingId, reset } = useGiftBuilderStore.getState()
      const payload = toPayload(draft)
      if (!payload || isSubmitting) return

      setIsSubmitting(true)
      setError(null)
      const save = editingId
        ? giftBoxApi.update(editingId, payload).then(() => useCartStore.getState().load())
        : giftBoxApi.create(payload).then((view) => useCartStore.getState().addGiftBox(view.id))
      save
        .then(() => {
          reset()
          showToast(editingId ? 'Đã cập nhật hộp quà tùy chỉnh' : 'Đã thêm hộp quà tùy chỉnh vào giỏ hàng', 'success')
          navigate('/cart')
        })
        .catch((err: unknown) => setError(toApiError(err).message))
        .finally(() => setIsSubmitting(false))
    })

  return { submit, isSubmitting, error, clearError: () => setError(null) }
}
