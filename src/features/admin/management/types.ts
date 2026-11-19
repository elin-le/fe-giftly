import type { UserStatus } from '@/features/auth/types'
import type { Review } from '@/features/orders/types'

export interface AdminCustomer {
  id: string
  fullName: string
  email: string
  phone: string | null
  status: UserStatus
  orderCount: number
  totalSpent: number
  lastOrderAt: string | null
}

export interface AdminReview extends Review {
  productName: string
}

export interface CategoryInput {
  name: string
  description: string | null
}
