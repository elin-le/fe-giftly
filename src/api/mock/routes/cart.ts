import type MockAdapter from 'axios-mock-adapter'
import type { AddCartItemPayload, SelectionInput } from '@/features/cart/types'
import { buildCartView } from '../cartView'
import { describeVariant, findVariantRef } from '../catalogView'
import { getCart, newId, type MockCartLine, type MockDb } from '../db'
import { fail, lastSegment, parseBody, withUser, type MockReply } from '../http'
import { findBundleOption, normalizeSelections, selectionKey } from '../selections'

interface AddItemBody {
  productVariantId?: string
  giftBoxConfigId?: string
  quantity?: number
  selections?: SelectionInput[]
}

const isQuantity = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1

const sellable = (ref: NonNullable<ReturnType<typeof findVariantRef>>) =>
  ref.product.status === 'AVAILABLE' && ref.variant.status === 'AVAILABLE' && ref.variant.stockQuantity > 0

function addVariantLine(db: MockDb, userId: string, body: AddItemBody, quantity: number): MockReply | null {
  const ref = findVariantRef(db, body.productVariantId)
  if (!ref || ref.product.status === 'DISCONTINUED' || ref.variant.status === 'DISCONTINUED') return fail(404, 'Sản phẩm không tồn tại hoặc đã ngừng bán')
  if (!sellable(ref)) return fail(409, `"${describeVariant(ref)}" đã hết hàng`)

  const normalized = normalizeSelections(db, ref.variant.id, body.selections)
  if ('error' in normalized) return fail(400, normalized.error)
  for (const selection of normalized.selections) {
    const option = findBundleOption(db, ref.variant, selection.bundleOptionId)
    const optionRef = option && findVariantRef(db, option.variantId)
    if (!optionRef || !sellable(optionRef)) return fail(409, `"${option?.productName ?? 'Lựa chọn'}" đã hết hàng`)
  }

  const cart = getCart(db, userId)
  const key = selectionKey(ref.variant.id, normalized.selections)
  const existing = cart.items.find((line) => line.variantId && selectionKey(line.variantId, line.selections) === key)
  const nextQuantity = (existing?.quantity ?? 0) + quantity
  if (nextQuantity > ref.variant.stockQuantity) return fail(409, `"${describeVariant(ref)}" chỉ còn ${ref.variant.stockQuantity} sản phẩm`)

  if (existing) existing.quantity = nextQuantity
  else cart.items.push({ id: newId(), variantId: ref.variant.id, giftBoxConfigId: null, quantity, selections: normalized.selections })
  return null
}

function addGiftBoxLine(db: MockDb, userId: string, giftBoxConfigId: string, quantity: number): MockReply | null {
  const config = db.giftBoxConfigs.find((candidate) => candidate.view.id === giftBoxConfigId && candidate.userId === userId)
  if (!config) return fail(404, 'Không tìm thấy hộp quà tùy chỉnh')
  if (quantity !== 1) return fail(400, 'Hộp quà tùy chỉnh chỉ có số lượng 1')

  const cart = getCart(db, userId)
  if (cart.items.some((line) => line.giftBoxConfigId === giftBoxConfigId)) return fail(409, 'Hộp quà này đã có trong giỏ hàng')
  cart.items.push({ id: newId(), variantId: null, giftBoxConfigId, quantity: 1, selections: [] } satisfies MockCartLine)
  return null
}

export function registerCartRoutes(mock: MockAdapter, db: MockDb): void {
  const respond = (userId: string): MockReply => {
    getCart(db, userId).updatedAt = new Date().toISOString()
    return [200, buildCartView(db, userId)]
  }

  mock.onGet('/cart').reply(withUser(db, (user) => [200, buildCartView(db, user.id)]))

  mock.onPost('/cart/items').reply(
    withUser(db, (user, config) => {
      const body = parseBody<Partial<AddCartItemPayload> & AddItemBody>(config)
      if (Boolean(body.productVariantId) === Boolean(body.giftBoxConfigId)) return fail(400, 'Cần chọn đúng một biến thể sản phẩm hoặc một hộp quà tùy chỉnh')
      if (!isQuantity(body.quantity)) return fail(400, 'Số lượng không hợp lệ')

      const problem = body.productVariantId
        ? addVariantLine(db, user.id, body, body.quantity)
        : addGiftBoxLine(db, user.id, body.giftBoxConfigId as string, body.quantity)
      return problem ?? respond(user.id)
    }),
  )

  mock.onPatch(/\/cart\/items\/[^/]+$/).reply(
    withUser(db, (user, config) => {
      const line = getCart(db, user.id).items.find((candidate) => candidate.id === lastSegment(config.url))
      if (!line) return fail(404, 'Không tìm thấy dòng trong giỏ hàng')

      const { quantity } = parseBody<AddItemBody>(config)
      if (!isQuantity(quantity)) return fail(400, 'Số lượng không hợp lệ')
      if (line.giftBoxConfigId && quantity !== 1) return fail(400, 'Hộp quà tùy chỉnh chỉ có số lượng 1')

      const ref = findVariantRef(db, line.variantId)
      if (ref && quantity > ref.variant.stockQuantity) return fail(409, `"${describeVariant(ref)}" chỉ còn ${ref.variant.stockQuantity} sản phẩm`)

      line.quantity = quantity
      return respond(user.id)
    }),
  )

  mock.onDelete(/\/cart\/items\/[^/]+$/).reply(
    withUser(db, (user, config) => {
      const cart = getCart(db, user.id)
      const id = lastSegment(config.url)
      if (!cart.items.some((line) => line.id === id)) return fail(404, 'Không tìm thấy dòng trong giỏ hàng')
      cart.items = cart.items.filter((line) => line.id !== id)
      return respond(user.id)
    }),
  )
}
