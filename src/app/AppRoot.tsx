import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { useCartSync } from '@/features/cart/hooks/useCartSync'
import { useGiftBuilderStore } from '@/features/gift-builder/giftBuilderStore'
import { useAuthStore } from '@/stores/authStore'

/**
 * Gốc của mọi route: đồng bộ giỏ hàng theo tài khoản, dọn bản nháp hộp quà khi đổi/đăng xuất tài khoản
 * và đặt vùng thông báo dùng chung.
 */
export function AppRoot() {
  const userId = useAuthStore((state) => state.user?.id ?? null)
  const previousUserId = useRef(userId)
  useCartSync()

  useEffect(() => {
    // Đăng nhập từ trạng thái khách (null → id) giữ bản nháp để khách làm tiếp; đổi hoặc đăng xuất thì xoá để không lộ sang người khác.
    if (previousUserId.current !== null && previousUserId.current !== userId) useGiftBuilderStore.getState().reset()
    previousUserId.current = userId
  }, [userId])

  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}
