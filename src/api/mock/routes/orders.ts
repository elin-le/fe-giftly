import type MockAdapter from 'axios-mock-adapter'
import type { CreateOrderPayload, OrderStatus } from '@/features/orders/types'
import type { MockDb } from '../db'
import { parseBody, withAdmin, withUser } from '../http'
import { changeOrderStatus, placeOrder } from '../orderFlow'

export function registerOrderRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onGet('/orders').reply(withAdmin(db, () => [200, db.orders]))

  mock.onGet('/orders/mine').reply(withUser(db, (user) => [200, db.orders.filter((order) => order.userId === user.id)]))

  mock.onPost('/orders').reply(withUser(db, (user, config) => placeOrder(db, user, parseBody<CreateOrderPayload>(config))))

  mock.onPatch(/\/orders\/[^/]+\/status$/).reply(
    withAdmin(db, (_admin, config) => {
      const orderId = config.url?.split('/')[2] ?? ''
      return changeOrderStatus(db, orderId, parseBody<{ status: OrderStatus }>(config).status)
    }),
  )
}
