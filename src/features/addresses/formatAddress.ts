import type { Address } from './types'

/** "12 Lê Lợi, Bến Nghé, Quận 1, TP. Hồ Chí Minh" — bỏ qua phần trống. */
export const formatAddress = (address: Pick<Address, 'addressLine' | 'ward' | 'district' | 'city'>): string =>
  [address.addressLine, address.ward, address.district, address.city].filter(Boolean).join(', ')
