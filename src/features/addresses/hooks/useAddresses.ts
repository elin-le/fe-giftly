import { useAsync } from '@/lib/useAsync'
import { addressesApi } from '../api/addressesApi'

export const useAddresses = () => useAsync(() => addressesApi.list(), [])
