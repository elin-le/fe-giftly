import type MockAdapter from 'axios-mock-adapter'
import type { GiftBoxPayload, GiftBoxReviewDecision } from '@/features/gift-builder/types'
import { buildGiftBoxView } from '../giftBoxConfig'
import { decideRequest, listRequests, updateConfig } from '../giftBoxRequests'
import type { MockDb } from '../db'
import { fail, lastSegment, parseBody, withAdmin, withUser } from '../http'

export function registerGiftBoxRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onPost('/gift-box-configs').reply(
    withUser(db, (user, config) => {
      const result = buildGiftBoxView(db, parseBody<GiftBoxPayload>(config))
      if ('reply' in result) return result.reply
      db.giftBoxConfigs.push({ userId: user.id, view: result.view, updatedAt: new Date().toISOString() })
      return [201, result.view]
    }),
  )

  // Khách xem lại để chỉnh sửa.
  mock.onGet(/\/gift-box-configs\/[^/]+$/).reply(
    withUser(db, (user, config) => {
      const found = db.giftBoxConfigs.find((c) => c.view.id === lastSegment(config.url) && c.userId === user.id)
      return found ? [200, found.view] : fail(404, 'Không tìm thấy hộp quà tùy chỉnh')
    }),
  )

  // Khách sửa yêu cầu của mình cho tới khi admin duyệt.
  mock.onPut(/\/gift-box-configs\/[^/]+$/).reply(
    withUser(db, (user, config) => updateConfig(db, user.id, lastSegment(config.url), parseBody<GiftBoxPayload>(config))),
  )

  mock.onGet('/admin/gift-box-requests').reply(withAdmin(db, () => [200, listRequests(db)]))

  mock.onPatch(/\/admin\/gift-box-requests\/[^/]+$/).reply(
    withAdmin(db, (_admin, config) => decideRequest(db, lastSegment(config.url), parseBody<GiftBoxReviewDecision>(config))),
  )
}
