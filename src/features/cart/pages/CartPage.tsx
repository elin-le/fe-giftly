import { ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CartGiftBoxLine } from "../components/CartGiftBoxLine";
import { CartLine } from "../components/CartLine";
import { CartTotals } from "../components/CartTotals";
import {
  selectCartIsEmpty,
  selectIsCartSyncing,
  useCartStore,
} from "../cartStore";
import { useCartActions } from "../hooks/useCartActions";

const LINE_MOTION = {
  layout: true,
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  className: "overflow-hidden",
} as const;

export function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const isEmpty = useCartStore(selectCartIsEmpty);
  const isSyncing = useCartStore(selectIsCartSyncing);
  const load = useCartStore((state) => state.load);
  const { setQuantity, removeItem } = useCartActions();

  if (!cart) {
    return error ? (
      <section
        role="alert"
        className="grid place-items-center gap-3 py-24 text-center"
      >
        <p className="text-danger">{error}</p>
        <Button variant="outline" onClick={() => void load()}>
          Thử lại
        </Button>
      </section>
    ) : (
      <div
        aria-busy="true"
        aria-label="Đang tải giỏ hàng"
        className="h-64 animate-pulse rounded-card bg-surface-raised"
      />
    );
  }

  if (isEmpty) {
    return (
      <section className="grid place-items-center gap-4 py-24 text-center">
        <ShoppingBag
          className="size-12 text-muted-foreground"
          strokeWidth={1.25}
        />
        <h1 className="text-2xl font-bold">Giỏ hàng đang trống</h1>
        <p className="text-muted-foreground">
          Chọn một hộp quà để bắt đầu nhé.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/products">Xem cửa hàng</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/builder">Tự thiết kế hộp quà</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6" aria-busy={isLoading || isSyncing}>
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold md:text-4xl">Giỏ hàng</h1>
        <span className="text-sm text-muted-foreground">
          {cart.items.length} sản phẩm
        </span>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {cart.items.map((item) => (
              <motion.div key={item.id} {...LINE_MOTION}>
                {item.giftBox ? (
                  <CartGiftBoxLine
                    item={item}
                    disabled={isSyncing}
                    onRemove={removeItem}
                  />
                ) : (
                  <CartLine
                    item={item}
                    disabled={isSyncing}
                    onQuantityChange={setQuantity}
                    onRemove={removeItem}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </ul>

        <div className="flex flex-col gap-5 rounded-card bg-primary p-6 text-primary-foreground shadow-pop lg:sticky lg:top-24">
          <CartTotals
            subtotal={cart.subtotal}
            shippingFee={cart.shippingFee}
            totalAmount={cart.totalAmount}
            requiredAdvanceAmount={cart.requiredAdvanceAmount}
          />
          <Button asChild variant="accent" size="lg">
            <Link to="/checkout">Tiến hành đặt hàng</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/products">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
