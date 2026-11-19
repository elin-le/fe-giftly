import type MockAdapter from 'axios-mock-adapter'
import { isPurchasable, isVisibleInStore } from '@/features/products/productRules'
import { validateProductInput } from '@/features/products/productInputRules'
import {
  type Product,
  type ProductInput,
  type ProductQuery,
  type ProductVariant,
} from '@/features/products/types'
import { resolveProducts } from '../catalogView'
import { newId, type MockDb } from '../db'
import { fail, lastSegment, parseBody, withAdmin } from '../http'

/** Biến thể đã nằm trong đơn hàng hoặc là thành phần/lựa chọn của set khác thì không được xoá (khoá ngoại trong DB). */
function findReferenceProblem(db: MockDb, variantIds: readonly string[], ownerProductId: string): string | null {
  const ids = new Set(variantIds)
  if (ids.size === 0) return null
  const inOrders = db.orders.some((order) =>
    order.items.some((item) => (item.productVariantId && ids.has(item.productVariantId)) || item.components.some((c) => c.productVariantId && ids.has(c.productVariantId))),
  )
  if (inOrders) return 'Biến thể đã có trong đơn hàng, hãy chuyển sang "Ngừng bán" thay vì xoá'
  const inBundles = db.products.some(
    (product) =>
      product.id !== ownerProductId &&
      product.variants.some((variant) =>
        variant.bundle?.components.some((c) => ids.has(c.variantId)) || variant.bundle?.optionGroups.some((g) => g.options.some((o) => ids.has(o.variantId))),
      ),
  )
  return inBundles ? 'Biến thể đang là thành phần hoặc lựa chọn của một set quà khác' : null
}

const validate = (db: MockDb, input: ProductInput, currentId?: string): string | null =>
  validateProductInput(input, { categoryIds: db.categories.map((c) => c.id), otherProducts: db.products.filter((p) => p.id !== currentId) })

/** AVAILABLE mà hết hàng thì là OUT_OF_STOCK (nhất quán với các thao tác trừ kho). */
const normalizeStatus = (variant: ProductVariant): ProductVariant =>
  variant.status === 'AVAILABLE' && variant.stockQuantity === 0 ? { ...variant, status: 'OUT_OF_STOCK' } : variant

/** Dựng sản phẩm đầy đủ từ dữ liệu admin đã hợp lệ; giữ id của ảnh/biến thể đã có. */
function buildProduct(db: MockDb, input: ProductInput, existing?: Product): Product {
  const id = existing?.id ?? newId()
  const takenOptionIds = new Set(db.products.filter((p) => p.id !== id).flatMap((p) => p.options.map((o) => o.id)))
  const options = input.options.map((option, index) => ({
    id: takenOptionIds.has(option.id) ? newId() : option.id, name: option.name.trim(), displayOrder: index + 1,
    values: option.values.map((value) => ({ id: value.id, value: value.value.trim(), colorHex: value.colorHex })),
  }))

  const images = input.images.map((image, index) => ({
    id: existing?.images.find((candidate) => candidate.imageUrl === image.imageUrl)?.id ?? newId(),
    imageUrl: image.imageUrl, secureUrl: image.imageUrl, publicId: `mock/${image.imageUrl.split('/').pop() ?? index}`, productVariantId: image.productVariantId,
    isThumbnail: input.images.some((candidate) => candidate.isThumbnail) ? image.isThumbnail : index === 0,
  }))

  const variants = input.variants.map((edit): ProductVariant => {
    const bundle = edit.bundle
      ? {
          components: edit.bundle.components.map((c) => ({
            id: newId(), variantId: c.componentVariantId, productId: '', productName: '', optionLabel: null,
            componentRole: c.componentRole, quantity: c.quantity, isRequired: c.isRequired, policy: null,
          })),
          optionGroups: edit.bundle.optionGroups.map((g, groupIndex) => ({
            id: newId(), name: g.name.trim(), displayOrder: groupIndex + 1, groupType: g.groupType, selectionType: g.selectionType,
            minSelections: g.minSelections, maxSelections: g.maxSelections, isRequired: g.isRequired,
            options: g.options.map((o) => ({
              id: newId(), variantId: o.productVariantId, productId: '', productName: '', optionLabel: null, productType: 'REGULAR' as const,
              pricingMode: o.pricingMode, fixedPrice: o.fixedPrice, price: 0, stockQuantity: 0, policy: null,
            })),
          })),
        }
      : null
    return normalizeStatus({
      id: edit.id ?? newId(), productId: id, sku: edit.sku.trim(), price: edit.price, stockQuantity: edit.stockQuantity, status: edit.status,
      dimensions: edit.dimensions, weight: edit.weight, optionValueIds: edit.optionValueIds, policy: edit.policy,
      giftBoxDetail: input.productType === 'READY_MADE_GIFT_BOX' ? edit.giftBoxDetail : null, bundle,
    })
  })

  return {
    id, categoryId: input.categoryId, name: input.name.trim(), description: input.description?.trim() || null, productType: input.productType,
    status: input.status, isCustomBoxEligible: input.productType === 'REGULAR' && Boolean(input.isCustomBoxEligible),
    images, options, variants, ratingAverage: null, reviewCount: 0,
  }
}

export function registerCatalogRoutes(mock: MockAdapter, db: MockDb): void {
  mock.onGet('/categories').reply(() => [200, db.categories])

  mock.onGet('/products').reply((config) => {
    const { search, categoryId, productType } = (config.params ?? {}) as ProductQuery
    const keyword = search?.trim().toLowerCase()
    const matches = (product: Product) =>
      (!categoryId || product.categoryId === categoryId) &&
      (!productType || product.productType === productType) &&
      (!keyword || `${product.name} ${product.description ?? ''}`.toLowerCase().includes(keyword))
    return [200, resolveProducts(db).filter(matches)]
  })

  /** Sản phẩm bán chạy trong 30 ngày gần nhất (theo số lượng ở đơn chưa huỷ); bổ sung bằng đánh giá khi chưa đủ. */
  mock.onGet('/products/featured').reply((config) => {
    const limit = Math.min(Number((config.params as { limit?: number } | undefined)?.limit ?? 8) || 8, 24)
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000
    const sold = new Map<string, number>()
    for (const order of db.orders) {
      if (order.status === 'CANCELLED' || new Date(order.orderedAt).getTime() < since) continue
      for (const item of order.items) {
        if (item.productId) sold.set(item.productId, (sold.get(item.productId) ?? 0) + item.quantity)
      }
    }
    const score = (p: Product) => (sold.get(p.id) ?? 0) * 1000 + (p.ratingAverage ?? 0) * (p.reviewCount ?? 0)
    const ranked = resolveProducts(db).filter((p) => isVisibleInStore(p) && isPurchasable(p)).sort((a, b) => score(b) - score(a))
    return [200, ranked.slice(0, limit).map((p) => ({ ...p, soldLast30Days: sold.get(p.id) ?? 0 }))]
  })

  mock.onGet(/\/products\/[^/]+$/).reply((config) => {
    const product = resolveProducts(db).find((candidate) => candidate.id === lastSegment(config.url))
    return product ? [200, product] : fail(404, 'Không tìm thấy sản phẩm')
  })

  mock.onPost('/products').reply(
    withAdmin(db, (_admin, config) => {
      const input = parseBody<ProductInput>(config)
      const problem = validate(db, input)
      if (problem) return fail(400, problem)
      if (input.variants.some((variant) => variant.id)) return fail(400, 'Biến thể mới không có id')
      const created = buildProduct(db, input)
      db.products.unshift(created)
      return [201, created]
    }),
  )

  mock.onPut(/\/products\/[^/]+$/).reply(
    withAdmin(db, (_admin, config) => {
      const id = lastSegment(config.url)
      const current = db.products.find((product) => product.id === id)
      if (!current) return fail(404, 'Không tìm thấy sản phẩm')
      const input = parseBody<ProductInput>(config)
      const problem = validate(db, input, id)
      if (problem) return fail(400, problem)
      if (input.variants.some((variant) => variant.id && !current.variants.some((v) => v.id === variant.id))) return fail(400, 'Biến thể không thuộc sản phẩm này')

      const keptIds = new Set(input.variants.flatMap((variant) => (variant.id ? [variant.id] : [])))
      const removed = current.variants.filter((variant) => !keptIds.has(variant.id)).map((variant) => variant.id)
      const referenced = findReferenceProblem(db, removed, id)
      if (referenced) return [409, { message: referenced }]

      const updated = buildProduct(db, input, current)
      db.products = db.products.map((product) => (product.id === id ? updated : product))
      return [200, updated]
    }),
  )

  mock.onDelete(/\/products\/[^/]+$/).reply(
    withAdmin(db, (_admin, config) => {
      const id = lastSegment(config.url)
      const current = db.products.find((product) => product.id === id)
      if (!current) return fail(404, 'Không tìm thấy sản phẩm')
      const referenced = findReferenceProblem(db, current.variants.map((variant) => variant.id), id)
      if (referenced) return [409, { message: referenced }]
      db.products = db.products.filter((product) => product.id !== id)
      return [204]
    }),
  )
}
