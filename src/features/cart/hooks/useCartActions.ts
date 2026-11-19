import { useCallback, useMemo } from 'react'
import { toApiError } from '@/api/errors'
import { useToastStore } from '@/stores/toastStore'
import { useCartStore } from '../cartStore'
import type { SelectionInput } from '../types'

/**
 * Các thao tác giỏ hàng dành cho UI: tự báo kết quả/lỗi bằng thông báo ngắn.
 * Hàm trả về `true` khi thành công để nơi gọi quyết định bước tiếp theo.
 */
export function useCartActions() {
  const showToast = useToastStore((state) => state.show)

  const run = useCallback(
    async (task: () => Promise<void>, successMessage?: string): Promise<boolean> => {
      try {
        await task()
        if (successMessage) showToast(successMessage, 'success')
        return true
      } catch (error) {
        showToast(toApiError(error).message, 'error')
        return false
      }
    },
    [showToast],
  )

  return useMemo(
    () => ({
      /** Thêm một biến thể (kèm lựa chọn của set quà nếu có); `name` chỉ dùng cho thông báo. */
      addVariant: (variantId: string, name: string, selections?: SelectionInput[], quantity = 1) =>
        run(() => useCartStore.getState().addVariant(variantId, quantity, selections), `Đã thêm "${name}" vào giỏ hàng`),
      setQuantity: (itemId: string, quantity: number) => run(() => useCartStore.getState().setQuantity(itemId, quantity)),
      removeItem: (itemId: string) => run(() => useCartStore.getState().removeItem(itemId), 'Đã xoá khỏi giỏ hàng'),
    }),
    [run],
  )
}
