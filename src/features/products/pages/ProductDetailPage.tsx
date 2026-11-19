import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthGate } from '@/features/auth/hooks/useAuthGate'
import { useCartActions } from '@/features/cart/hooks/useCartActions'
import { GiftBoxContents } from '@/features/gift-builder/components/GiftBoxContents'
import { PolicyNotes } from '@/features/gift-builder/components/PolicyNotes'
import { formatDimensions, formatWeight } from '@/features/gift-builder/fit'
import { reviewsApi } from '@/features/orders/api/reviewsApi'
import { flyToCart } from '@/lib/flyToCart'
import { formatCurrency } from '@/lib/format'
import { useAsync } from '@/lib/useAsync'
import { BundleOptionPicker } from '../components/BundleOptionPicker'
import { ProductImage } from '../components/ProductImage'
import { RatingStars } from '../components/RatingStars'
import { ReviewList } from '../components/ReviewList'
import { VariantOptionPicker } from '../components/VariantOptionPicker'
import { calcSurcharge, EMPTY_CHOICE, getChoiceIssues, toSelectionInputs, type BundleChoice } from '../bundleSelection'
import { useProduct } from '../hooks/useProducts'
import { mergePolicies } from '../policy'
import { findVariant, getDefaultSelection, isVariantPurchasable, type OptionSelection } from '../productRules'
import { PRODUCT_TYPE_LABELS, type Product } from '../types'

export function ProductDetailPage() {
  const { id } = useParams()
  const product = useProduct(id)

  if (product.error) {
    return (
      <section role="alert" className="grid place-items-center gap-3 py-24 text-center">
        <p className="text-danger">{product.error}</p>
        <Button asChild variant="outline">
          <Link to="/products">Về cửa hàng</Link>
        </Button>
      </section>
    )
  }
  if (!product.data) return <div aria-busy="true" aria-label="Đang tải sản phẩm" className="h-96 animate-pulse rounded-card bg-surface-raised" />

  // key: đổi sản phẩm thì khởi tạo lại lựa chọn.
  return <ProductDetail key={product.data.id} product={product.data} />
}

function ProductDetail({ product }: { product: Product }) {
  const requireAuth = useAuthGate()
  const { addVariant } = useCartActions()
  const reviews = useAsync(() => reviewsApi.listForProduct(product.id), [product.id])

  const [selection, setSelection] = useState<OptionSelection>(() => getDefaultSelection(product))
  const imageRef = useRef<HTMLDivElement>(null)
  const [choice, setChoice] = useState<BundleChoice>(EMPTY_CHOICE)

  const variant = useMemo(() => (product.options.length === 0 ? product.variants[0] : findVariant(product, selection)), [product, selection])
  const bundle = variant?.bundle ?? null

  const issues = bundle ? getChoiceIssues(choice, bundle) : []
  const unitPrice = (variant?.price ?? 0) + (bundle ? calcSurcharge(choice, bundle) : 0)
  const canBuy = product.status === 'AVAILABLE' && !!variant && isVariantPurchasable(variant) && issues.length === 0

  const policy = useMemo(() => {
    if (!variant) return null
    const picked = new Set(Object.values(choice.picked).flat())
    const optionPolicies = bundle ? bundle.optionGroups.flatMap((g) => g.options).filter((o) => picked.has(o.id)).map((o) => o.policy) : []
    const componentPolicies = bundle?.components.map((c) => c.policy) ?? []
    return mergePolicies([variant.policy, ...componentPolicies, ...optionPolicies])
  }, [variant, bundle, choice.picked])

  const handleAdd = () => {
    if (!variant || !canBuy) return
    flyToCart(imageRef.current, product.images[0]?.imageUrl)
    const label = product.name
    requireAuth('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.', () => {
      void addVariant(variant.id, label, bundle ? toSelectionInputs(choice, bundle) : [])
    })
  }

  const changeOption = (optionId: string, valueId: string) => {
    setSelection((current) => ({ ...current, [optionId]: valueId }))
    setChoice(EMPTY_CHOICE)
  }

  return (
    <article className="flex flex-col gap-10">
      <Button asChild variant="ghost" className="self-start">
        <Link to="/products">
          <ArrowLeft /> Cửa hàng
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div ref={imageRef} className="overflow-hidden rounded-card border border-border">
          <ProductImage product={product} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">{PRODUCT_TYPE_LABELS[product.productType]}</span>
            <h1 className="break-words text-3xl font-bold md:text-4xl">{product.name}</h1>
            <RatingStars value={product.ratingAverage} count={product.reviewCount} />
            {product.description && <p className="whitespace-pre-line break-words text-muted-foreground">{product.description}</p>}
          </div>

          {product.options.length > 0 && <VariantOptionPicker product={product} selection={selection} onChange={changeOption} />}

          {!variant && <p className="text-sm text-danger">Tổ hợp này hiện không có sẵn.</p>}

          {variant && (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Mã SKU</dt>
              <dd>{variant.sku}</dd>
              {variant.dimensions && (
                <>
                  <dt className="text-muted-foreground">Kích thước</dt>
                  <dd>{formatDimensions(variant.dimensions)}</dd>
                </>
              )}
              {variant.weight && (
                <>
                  <dt className="text-muted-foreground">Khối lượng</dt>
                  <dd>{formatWeight(variant.weight)}</dd>
                </>
              )}
              {variant.giftBoxDetail?.inner && (
                <>
                  <dt className="text-muted-foreground">Lòng hộp</dt>
                  <dd>{formatDimensions(variant.giftBoxDetail.inner)}</dd>
                </>
              )}
              {variant.giftBoxDetail?.maxWeight && (
                <>
                  <dt className="text-muted-foreground">Tải tối đa</dt>
                  <dd>{formatWeight(variant.giftBoxDetail.maxWeight)}</dd>
                </>
              )}
              {variant.policy?.isPerishable && variant.policy.shelfLifeHours !== null && (
                <>
                  <dt className="text-muted-foreground">Hạn dùng</dt>
                  <dd>{variant.policy.shelfLifeHours} giờ</dd>
                </>
              )}
            </dl>
          )}

          {bundle && bundle.components.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Trong set gồm</h2>
              <GiftBoxContents
                lines={bundle.components.map((component) => ({
                  id: component.id,
                  role: component.componentRole,
                  name: component.optionLabel ? `${component.productName} (${component.optionLabel})` : component.productName,
                  quantity: component.quantity,
                  isComplimentary: component.componentRole === 'ACCESSORY',
                }))}
              />
            </section>
          )}

          {bundle && bundle.optionGroups.length > 0 && <BundleOptionPicker bundle={bundle} choice={choice} onChange={setChoice} />}

          <div className="flex flex-col gap-3 rounded-card bg-primary p-5 text-primary-foreground">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm opacity-80">
                {variant ? (isVariantPurchasable(variant) ? `Còn ${variant.stockQuantity} sản phẩm` : 'Hết hàng') : ''}
              </span>
              <span className="text-2xl font-bold">{variant ? formatCurrency(unitPrice) : '—'}</span>
            </div>
            {policy && <div className="text-accent-soft"><PolicyNotes policy={policy} subtotal={unitPrice} /></div>}
            {issues.length > 0 && (
              <ul role="alert" className="text-sm text-accent-soft">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
            <Button variant="accent" size="lg" disabled={!canBuy} onClick={handleAdd}>
              <ShoppingBag /> Thêm vào giỏ hàng
            </Button>
          </div>
        </div>
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" className="text-2xl font-bold">
          Đánh giá
        </h2>
        {reviews.error ? <p className="text-danger">{reviews.error}</p> : <ReviewList reviews={reviews.data ?? []} />}
      </section>
    </article>
  )
}
