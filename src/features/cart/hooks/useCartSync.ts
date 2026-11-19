import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '../cartStore'

/** Giữ giỏ hàng khớp với tài khoản: đăng nhập → tải giỏ của người đó; đăng xuất/đổi tài khoản → xoá giỏ đang giữ. */
export function useCartSync(): void {
  const userId = useAuthStore((state) => state.user?.id ?? null)

  useEffect(() => {
    const { load, reset } = useCartStore.getState()
    reset()
    if (userId) void load()
  }, [userId])
}
