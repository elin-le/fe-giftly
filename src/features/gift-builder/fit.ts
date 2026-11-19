import type { DimensionUnit, Dimensions, Weight, WeightUnit } from '@/features/products/types'
import { MAX_CONTENT_ITEMS, OVERFLOW_TOLERANCE, UNDERFILL_THRESHOLD } from './constants'

const MM_PER_UNIT: Record<DimensionUnit, number> = { MM: 1, CM: 10, M: 1000 }
const GRAM_PER_UNIT: Record<WeightUnit, number> = { G: 1, KG: 1000 }

export const toGrams = (weight: Weight): number => weight.value * GRAM_PER_UNIT[weight.unit]

/** Thể tích bao ngoài (mm³). */
export const toVolumeMm3 = ({ length, width, height, unit }: Dimensions): number =>
  length * width * height * MM_PER_UNIT[unit] ** 3

export interface FitBox {
  inner: Dimensions | null
  maxWeight: Weight | null
}

export interface FitItem {
  dimensions: Dimensions | null
  weight: Weight | null
  quantity: number
}

export interface Fill {
  count: number
  weightUsedG: number
  maxWeightG: number | null
  volumeUsedMm3: number
  innerVolumeMm3: number | null
  /** Tỷ lệ khối lượng/thể tích đã dùng so với sức chứa (chỉ số lớn hơn); null nếu hộp không có số đo. */
  capacityRatio: number | null
  /** 0–1+ ; ≥ 1 nghĩa là đầy. Lấy chỉ số chặt nhất trong khối lượng / thể tích / số món. */
  ratio: number
  isOver: boolean
}

/**
 * Ước tính độ đầy của hộp.
 * Tổng thể tích bao ngoài của các món chỉ là điều kiện CẦN để xếp vừa (không phải đủ), nên chỉ từ chối
 * khi chắc chắn không vừa (vượt tải trọng hoặc tổng thể tích lớn hơn lòng hộp), không từ chối nhầm hộp xếp được.
 */
export function computeFill(box: FitBox | null, items: readonly FitItem[]): Fill {
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const weightUsedG = items.reduce((sum, item) => sum + (item.weight ? toGrams(item.weight) * item.quantity : 0), 0)
  const volumeUsedMm3 = items.reduce(
    (sum, item) => sum + (item.dimensions ? toVolumeMm3(item.dimensions) * item.quantity : 0),
    0,
  )
  const maxWeightG = box?.maxWeight ? toGrams(box.maxWeight) : null
  const innerVolumeMm3 = box?.inner ? toVolumeMm3(box.inner) : null

  const ratios = [count / MAX_CONTENT_ITEMS]
  if (maxWeightG) ratios.push(weightUsedG / maxWeightG)
  if (innerVolumeMm3) ratios.push(volumeUsedMm3 / innerVolumeMm3)

  const isOver =
    count > MAX_CONTENT_ITEMS ||
    (maxWeightG !== null && weightUsedG > maxWeightG) ||
    (innerVolumeMm3 !== null && volumeUsedMm3 > innerVolumeMm3)

  const capacityRatios = ratios.slice(1)
  const capacityRatio = capacityRatios.length > 0 ? Math.max(...capacityRatios) : null
  return { count, weightUsedG, maxWeightG, volumeUsedMm3, innerVolumeMm3, capacityRatio, ratio: Math.max(...ratios), isOver }
}

/** "22 × 22 × 10 cm" */
export const formatDimensions = ({ length, width, height, unit }: Dimensions): string =>
  `${length} × ${width} × ${height} ${unit.toLowerCase()}`

/** "2,5 kg" */
export function formatWeight({ value, unit }: Weight): string {
  const text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value)
  return `${text} ${unit === 'G' ? 'g' : 'kg'}`
}

/**
 * EMPTY: chưa có món · UNDER: còn trống nhiều (nhắc khách) · OK · OVER_REVIEW: vượt nhẹ — cho thêm nhưng admin phải duyệt ·
 * OVER_LIMIT: vượt quá mức chấp nhận được hoặc quá số món — từ chối.
 */
export type FitStatus = 'EMPTY' | 'UNDER' | 'OK' | 'OVER_REVIEW' | 'OVER_LIMIT'

export function getFitStatus(fill: Fill): FitStatus {
  if (fill.count === 0) return 'EMPTY'
  if (fill.count > MAX_CONTENT_ITEMS) return 'OVER_LIMIT'
  const capacity = fill.capacityRatio
  if (capacity === null) return 'OK'
  if (capacity > 1 + OVERFLOW_TOLERANCE) return 'OVER_LIMIT'
  if (capacity > 1) return 'OVER_REVIEW'
  return capacity < UNDERFILL_THRESHOLD ? 'UNDER' : 'OK'
}
