import type { AdminCustomer } from './types'

const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Lọc theo tên, email hoặc số điện thoại (không phân biệt hoa thường/dấu); chuỗi rỗng trả về tất cả. */
export function filterCustomers(customers: readonly AdminCustomer[], keyword: string): AdminCustomer[] {
  const needle = normalize(keyword.trim())
  if (!needle) return [...customers]
  return customers.filter((c) => normalize(`${c.fullName} ${c.email} ${c.phone ?? ''}`).includes(needle))
}
