import { apiClient } from '@/api/client'
import { ensureArray } from '@/api/ensureArray'
import type { Address, AddressInput } from '../types'

export const addressesApi = {
  list: () => apiClient.get<unknown>('/addresses').then((res) => ensureArray<Address>(res.data)),

  create: (input: AddressInput) => apiClient.post<Address>('/addresses', input).then((res) => res.data),
}
