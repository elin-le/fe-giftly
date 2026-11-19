import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AddressPicker } from '../components/AddressPicker'
import { ConfirmOrderDialog } from '../components/ConfirmOrderDialog'
import { OrderSuccess } from '../components/OrderSuccess'
import { OrderSummary } from '../components/OrderSummary'
import { PaymentPicker } from '../components/PaymentPicker'
import { useCheckout } from '../hooks/useCheckout'

export function CheckoutPage() {
  const checkout = useCheckout()
  const { cart } = checkout

  if (checkout.step === 'success' && checkout.order) return <OrderSuccess order={checkout.order} />

  if (!cart || checkout.addressesLoading) {
    return <div aria-busy="true" aria-label="Đang tải" className="h-64 animate-pulse rounded-card bg-surface-raised" />
  }

  if (checkout.addressesError) {
    return (
      <section role="alert" className="grid place-items-center gap-3 py-24 text-center">
        <p className="text-danger">{checkout.addressesError}</p>
        <Button variant="outline" onClick={checkout.reloadAddresses}>
          Thử lại
        </Button>
      </section>
    )
  }

  if (checkout.isCartEmpty) {
    return (
      <section className="grid place-items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Chưa có sản phẩm để thanh toán</h1>
        <Button asChild>
          <Link to="/products">Chọn quà ngay</Link>
        </Button>
      </section>
    )
  }

  const isDialogOpen = checkout.step === 'confirming' || checkout.step === 'submitting'

  return (
    <section className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold md:text-4xl">Thanh toán</h1>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AddressPicker
            addresses={checkout.addresses}
            selectedId={checkout.address?.id ?? null}
            onSelect={checkout.selectAddress}
            onCreated={checkout.addAddress}
          />
          <PaymentPicker value={checkout.paymentMethod} onChange={checkout.setPaymentMethod} codDisabled={checkout.requiresAdvance} />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary cart={cart} />
          <Button size="lg" variant="accent" disabled={!checkout.address} onClick={checkout.requestConfirmation}>
            Xem lại đơn hàng
          </Button>
        </aside>
      </div>

      <ConfirmOrderDialog
        open={isDialogOpen}
        address={checkout.address}
        paymentMethod={checkout.paymentMethod}
        cart={cart}
        isSubmitting={checkout.step === 'submitting'}
        error={checkout.error}
        onConfirm={() => void checkout.confirmOrder()}
        onCancel={checkout.cancelConfirmation}
      />
    </section>
  )
}
