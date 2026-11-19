export interface Address {
  id: string
  recipientName: string
  phone: string
  addressLine: string
  ward: string | null
  district: string | null
  city: string | null
  isDefault: boolean
}

export type AddressInput = Omit<Address, 'id'>
