import type MockAdapter from 'axios-mock-adapter'
import type { AddressInput } from '@/features/addresses/types'
import { newId, type MockDb } from '../db'
import { fail, parseBody, toAddress, withUser } from '../http'

const clean = (value: unknown): string | null => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null)

export function registerAddressRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onGet('/addresses').reply(
    withUser(db, (user) => {
      const mine = db.addresses.filter((address) => address.userId === user.id)
      return [200, [...mine].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)).map(toAddress)]
    }),
  )

  mock.onPost('/addresses').reply(
    withUser(db, (user, config) => {
      const input = parseBody<AddressInput>(config)
      const recipientName = clean(input.recipientName)
      const phone = clean(input.phone)
      const addressLine = clean(input.addressLine)
      if (!recipientName || !phone || !addressLine) return fail(400, 'Vui lòng nhập tên người nhận, số điện thoại và địa chỉ')

      const isFirst = !db.addresses.some((address) => address.userId === user.id)
      const isDefault = isFirst || input.isDefault === true
      // Mỗi người dùng chỉ có một địa chỉ mặc định
      if (isDefault) db.addresses = db.addresses.map((a) => (a.userId === user.id ? { ...a, isDefault: false } : a))

      const created = {
        id: newId(), userId: user.id, recipientName, phone, addressLine,
        ward: clean(input.ward), district: clean(input.district), city: clean(input.city), isDefault,
      }
      db.addresses.push(created)
      return [201, toAddress(created)]
    }),
  )
}
