import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toApiError } from '@/api/errors'
import { giftBoxApi } from '../api/giftBoxApi'
import type { BuilderCatalog } from '../catalog'
import { draftFromView } from '../giftBox'
import { useGiftBuilderStore } from '../giftBuilderStore'
import type { GiftBoxView } from '../types'

/**
 * Chế độ chỉnh sửa (`/builder?edit=<id>`): tải cấu hình đã lưu rồi nạp vào bản nháp một lần khi danh mục sẵn sàng.
 * Nếu admin đã duyệt, server từ chối sửa nên trả về `error` để trang báo cho khách.
 */
export function useEditGiftBox(catalog: BuilderCatalog & { isLoading: boolean }) {
  const [params] = useSearchParams()
  const editId = params.get('edit')
  const [view, setView] = useState<GiftBoxView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hydrated = useRef<string | null>(null)

  useEffect(() => {
    if (!editId) return
    let cancelled = false
    giftBoxApi
      .get(editId)
      .then((loaded) => !cancelled && setView(loaded))
      .catch((err: unknown) => !cancelled && setError(toApiError(err).message))
    return () => {
      cancelled = true
    }
  }, [editId])

  useEffect(() => {
    if (!editId || !view || catalog.isLoading || hydrated.current === editId) return
    hydrated.current = editId
    const entries = [...catalog.boxes, ...catalog.items, ...catalog.accessories, ...catalog.cards]
    useGiftBuilderStore.getState().load(draftFromView(view, entries), editId)
  }, [editId, view, catalog])

  return { isEditing: !!editId, view, error }
}
