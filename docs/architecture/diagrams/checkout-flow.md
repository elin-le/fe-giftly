# Luồng đặt hàng (Checkout)

## Máy trạng thái của `useCheckout`

```mermaid
stateDiagram-v2
  [*] --> editing
  editing --> confirming: đã chọn địa chỉ (requestConfirmation)
  confirming --> editing: "Quay lại chỉnh sửa" (cancelConfirmation)
  confirming --> submitting: "Xác nhận đặt hàng" (confirmOrder)
  submitting --> success: API trả về đơn hàng, tải lại giỏ (rỗng)
  submitting --> confirming: API lỗi, giữ giỏ, hiện lỗi
  success --> [*]
```

Trong `submitting`, mọi thao tác `confirmOrder` / `cancelConfirmation` bị bỏ qua để tránh gửi lặp.

## Thanh toán theo giai đoạn

```mermaid
flowchart TD
  C[Giỏ hàng] --> A{Có dòng yêu cầu đặt cọc?}
  A -- không --> F[1 payment: FULL_PAYMENT = tổng]
  A -- có --> M{Phương thức}
  M -- COD --> X[Bị từ chối: tự chuyển sang chuyển khoản]
  M -- khác --> P[2 payment: ADVANCE_PAYMENT = Σ tiền cọc<br/>REMAINING_PAYMENT = tổng − cọc]
  F --> S[Admin CONFIRMED: trả trước → PAID · DELIVERED: còn lại/COD → PAID]
  P --> S
  S --> R[CANCELLED / FAILED / RETURNED: PAID → REFUNDED, PENDING → FAILED]
```

## Trình tự

```mermaid
sequenceDiagram
  actor U as Khách hàng
  participant P as CheckoutPage
  participant H as useCheckout
  participant D as ConfirmOrderDialog
  participant B as Backend

  P->>B: GET /addresses (và giỏ đã có trong cartStore)
  U->>P: Chọn / thêm địa chỉ (POST /addresses), chọn thanh toán
  U->>P: "Xem lại đơn hàng"
  P->>H: requestConfirmation()
  H->>D: mở hộp thoại
  U->>D: "Xác nhận đặt hàng"
  D->>H: confirmOrder()
  H->>B: POST /orders { addressId, paymentMethod }
  Note over B: kiểm tra tồn theo biến thể, chốt snapshot,<br/>tách payment cọc / phần còn lại
  alt thành công
    B-->>H: 201 Order (orderNumber)
    H->>B: GET /cart (đã rỗng)
    H-->>U: màn hình thành công + mã đơn
  else lỗi (vd. 409 hết hàng)
    B-->>H: 4xx { message }
    H-->>D: hiện lỗi, giữ giỏ hàng
  end
```
