# Đặc tả API — Giftly (hợp đồng FE ↔ BE)

> Mock backend (`src/api/mock`) **phải khớp** tài liệu này. Base URL: `VITE_API_BASE_URL` (mặc định `/api`).
> Lược đồ dữ liệu bám `docs/architecture/database-design.md` (cột `snake_case` ↔ trường `camelCase`).

## 1. Quy ước

- Định dạng JSON. Khoá chính là **UUID** (chuỗi). Tiền là số nguyên VND (cột `NUMERIC(19,2)` được trả về dạng số).
- Thời gian: ISO-8601. Lỗi: `{ "message": "<tiếng Việt thân thiện>" }` kèm mã HTTP; FE chuẩn hóa thành `ApiError`.
- Xác thực: `Authorization: Bearer <token>`. Thiếu/hết hạn token → `401`; thiếu vai trò → `403`.
- Chỉ tài khoản `ACTIVE` đăng nhập được.

| Mã | Ý nghĩa |
|---|---|
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập: "Vui lòng đăng nhập để tiếp tục" |
| 403 | Không đủ quyền: "Bạn không có quyền thực hiện thao tác này" |
| 404 | Không tìm thấy |
| 409 | Xung đột (hết hàng, trùng email, sai luồng trạng thái…) |

## 2. Kiểu dữ liệu

```ts
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
type RoleName = 'ROLE_USER' | 'ROLE_ADMIN'
interface User { id; email; fullName; phone: string | null; status: UserStatus; roles: RoleName[] }
interface AuthSession { token: string; user: User }

interface Category { id; name; description: string | null }

// ── Danh mục: product → option → variant ─────────────────────────────
type ProductType = 'REGULAR' | 'READY_MADE_GIFT_SET' | 'READY_MADE_GIFT_BOX' | 'PACKAGING_ACCESSORY' | 'GREETING_CARD'
type ProductStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED'        // dùng cho cả product và product_variant
type ComponentRole = 'BOX' | 'PRODUCT' | 'ACCESSORY' | 'GREETING_CARD'
type ReturnPolicy = 'RETURNABLE' | 'NO_RETURN'
type MessageRenderingMethod = 'HANDWRITTEN' | 'PRINTED'
interface Dimensions { length; width; height; unit: 'MM' | 'CM' | 'M' }
interface Weight { value; unit: 'G' | 'KG' }

interface Product {
  id; categoryId; name; description: string | null; productType: ProductType; status: ProductStatus
  isCustomBoxEligible: boolean                       // REGULAR chỉ vào hộp tùy chỉnh khi true (admin quyết định)
  images: { id; imageUrl; secureUrl; publicId; isThumbnail; productVariantId: string | null }[]  // null = ảnh chung
  options: { id; name; displayOrder: number | null; values: { id; value; colorHex: string | null }[] }[]
  variants: ProductVariant[]
  ratingAverage: number | null; reviewCount: number  // gộp mọi biến thể theo product_id
}
interface ProductVariant {                           // đơn vị bán thật: giá, tồn kho, SKU nằm ở đây
  id; productId; sku; price; stockQuantity; status: ProductStatus
  dimensions: Dimensions | null; weight: Weight | null
  optionValueIds: string[]                           // product_variant_option_value
  policy: { isPerishable; shelfLifeHours: number | null; returnPolicy: ReturnPolicy | null; advancePaymentPercent: number | null } | null
  giftBoxDetail: { inner: Dimensions | null; maxWeight: Weight | null } | null     // chỉ READY_MADE_GIFT_BOX
  bundle: Bundle | null                              // chỉ READY_MADE_GIFT_SET
}
interface Bundle {
  components: { id; variantId; productId; productName; optionLabel; componentRole: ComponentRole; quantity; isRequired }[]  // cố định, đã nằm trong giá set
  optionGroups: {
    id; name; groupType: 'GREETING_CARD' | 'PACKAGING_ACCESSORY' | 'OTHER'; selectionType: 'SINGLE' | 'MULTIPLE'
    minSelections: number | null; maxSelections: number | null; isRequired: boolean; displayOrder: number | null
    options: { id; variantId; productId; productName; optionLabel; productType; pricingMode: 'FREE' | 'PRODUCT_PRICE' | 'FIXED_PRICE'
               fixedPrice: number | null; price: number /* phụ phí server tính */; stockQuantity }[]
  }[]
}

interface Address { id; recipientName; phone; addressLine; ward|null; district|null; city|null; isDefault }

// ── Hộp quà tùy chỉnh ────────────────────────────────────────────────
interface GiftBoxLine {
  variantId; productId; productName; optionLabel: string | null; productType; role: ComponentRole
  listPrice; unitPrice /* 0 nếu miễn phí */; isComplimentary; quantity
  messageText: string | null; messageRenderingMethod: MessageRenderingMethod | null   // chỉ thiệp
}
interface GiftBoxView {                              // gift_box_config + gift_box_config_item, giá do server tính
  id; box: GiftBoxLine; items: GiftBoxLine[]; price: number
  returnPolicy: ReturnPolicy; advancePaymentPercent: number         // chính sách tổng hợp
  reviewStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED'  // vượt sức chứa trong dung sai → PENDING
  reviewNote: string | null                          // lý do tự sinh hoặc phản hồi của admin
  capacityRatio: number | null                       // 1 = vừa đủ; null nếu hộp thiếu số đo
}

// ── Giỏ hàng ─────────────────────────────────────────────────────────
interface Cart {
  id; updatedAt: string | null; items: CartItem[]; subtotal; shippingFee; totalAmount
  requiredAdvanceAmount: number                      // Σ tiền cọc các dòng; 0 nếu không cần cọc
}
// cart_item: đúng MỘT trong variant / giftBox
type CartItem = {
  id; quantity; unitPrice /* gồm phụ phí lựa chọn */; subtotal
  returnPolicy: ReturnPolicy; advancePaymentPercent: number; advanceAmount: number
} & (
  | { variant: { id; productId; productName; sku; optionLabel: string | null; imageUrl: string | null; stockQuantity; isGiftSet: boolean; productType: ProductType }
      selections: { bundleOptionId; productName; optionLabel; pricingMode; quantity; unitPrice; messageText: string | null; messageRenderingMethod: MessageRenderingMethod | null }[]
      giftBox: null }
  | { variant: null; selections: []; giftBox: GiftBoxView }
)

// ── Đơn hàng: chỉ đọc snapshot ───────────────────────────────────────
type OrderStatus = 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'PROCESSING' | 'PACKAGING' | 'READY_TO_SHIP' | 'SHIPPING'
  | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED' | 'FAILED'
type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'E_WALLET' | 'CREDIT_CARD' | 'DEBIT_CARD'
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
type PaymentStage = 'FULL_PAYMENT' | 'ADVANCE_PAYMENT' | 'REMAINING_PAYMENT'
interface Order {
  id; userId; customer: { id; fullName; email }; address: Address     // snapshot tại lúc đặt
  orderNumber: string                                                  // vd. "GFT-0007", duy nhất
  subtotal; shippingFee; totalAmount; requiredAdvanceAmount: number | null; status: OrderStatus; orderedAt
  items: OrderItem[]
  payments: { id; paymentMethod; paymentStatus; paymentStage; amount; paidAt: string | null }[]   // 1 (toàn bộ) hoặc 2 (cọc + còn lại)
}
interface OrderItem {                                                  // order_item: đúng MỘT trong productVariantId / giftBoxConfigId
  id; productVariantId: string | null; productId: string | null; giftBoxConfigId: string | null
  itemNameSnapshot; skuSnapshot: string | null; variantSnapshot: Record<string, string> | null   // {"Màu": "Hồng"}
  unitPrice; quantity; subtotal
  returnPolicySnapshot; advancePaymentPercentSnapshot; isPerishableSnapshot; shelfLifeHoursSnapshot; requiredAdvanceAmount
  components: {                                                        // order_item_component (set quà / hộp tùy chỉnh)
    id; productVariantId; productId; componentRole; productNameSnapshot; skuSnapshot; variantSnapshot
    quantity; unitPrice; isComplimentary; messageText; messageRenderingMethod
    returnPolicySnapshot; advancePaymentPercentSnapshot; isPerishableSnapshot; shelfLifeHoursSnapshot
  }[]
}

interface Review {                                                     // không có trạng thái duyệt: hợp lệ là hiển thị
  id; userId; userName; productId; productVariantId: string | null
  orderItemId: string | null; orderItemComponentId: string | null     // đúng một nguồn mua
  rating: number /* 1–5 */; title: string | null; comment: string | null; createdAt
}
```

## 3. Xác thực

### `POST /auth/login` — công khai
Body `{ email, password }` → `200 AuthSession`.
`401` "Email hoặc mật khẩu không đúng" · `403` khi `SUSPENDED` ("tạm khoá") hoặc `INACTIVE` ("không còn hoạt động").

### `POST /auth/register` — công khai
Body `{ fullName, email, password, phone? }` → `201 AuthSession` (đăng nhập luôn, vai trò `ROLE_USER`).
`400` thiếu tên / email sai định dạng / mật khẩu < 8 ký tự · `409` "Email này đã được đăng ký".

Đăng xuất xảy ra ở FE (xoá token); không cần endpoint.

## 4. Danh mục & sản phẩm

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /categories` | công khai | `200 Category[]` |
| `GET /products?search=&categoryId=&productType=` | công khai | `200 Product[]` (kèm `variants`, `options`, `bundle`, điểm đánh giá). `search` khớp tên + mô tả (không phân biệt hoa thường). Gồm cả `DISCONTINUED`; storefront tự ẩn |
| `GET /products/featured?limit=8` | công khai | `200 Product[]` — bán chạy 30 ngày gần nhất (theo số lượng ở đơn chưa huỷ), bổ sung theo đánh giá; không gồm `DISCONTINUED`. Dùng cho trang chủ |
| `GET /products/:id` | công khai | `200 Product`; `404` nếu không có |
| `GET /products/:id/reviews` | công khai | `200 Review[]` mới nhất trước (mọi biến thể của sản phẩm) |
| `POST /products` | ADMIN | Body `ProductInput` → `201 Product` |
| `PUT /products/:id` | ADMIN | Body `ProductInput` (thay toàn bộ ảnh, tuỳ chọn, biến thể) → `200 Product`; `404` nếu không có; `409` khi bỏ biến thể đã có trong đơn hàng hoặc đang là thành phần/lựa chọn của set khác |
| `DELETE /products/:id` | ADMIN | → `204`; `404` nếu không có; `409` nếu sản phẩm đã có trong đơn hàng hoặc là thành phần của set khác |

```ts
interface ProductInput {
  categoryId: string; name: string; description: string | null
  productType: ProductType; status: ProductStatus
  isCustomBoxEligible: boolean                 // chỉ giữ với REGULAR
  images: { imageUrl: string; isThumbnail: boolean; productVariantId: string | null }[]   // null = ảnh chung
  options: { id: string; name: string; values: { id: string; value: string; colorHex: string | null }[] }[]  // thứ tự = display_order; id do client sinh (UUID)
  variants: VariantInput[]                     // có id = cập nhật; không id = tạo mới; biến thể vắng mặt = xoá
}
interface VariantInput {
  id?: string; sku: string; price: number; stockQuantity: number; status: ProductStatus
  optionValueIds: string[]                     // đúng một giá trị cho mỗi tuỳ chọn
  dimensions: { length: number; width: number; height: number; unit: 'MM'|'CM'|'M' } | null
  weight: { value: number; unit: 'G'|'KG' } | null
  policy: { isPerishable: boolean; shelfLifeHours: number | null; returnPolicy: 'RETURNABLE'|'NO_RETURN' | null; advancePaymentPercent: number | null } | null
  giftBoxDetail: { inner: Dimensions | null; maxWeight: Weight | null } | null           // chỉ READY_MADE_GIFT_BOX
  bundle: {                                                                              // chỉ READY_MADE_GIFT_SET
    components: { componentVariantId: string; componentRole: ComponentRole; quantity: number; isRequired: boolean }[]
    optionGroups: { name: string; groupType: OptionGroupType; selectionType: 'SINGLE'|'MULTIPLE'; minSelections: number | null; maxSelections: number | null; isRequired: boolean
                    options: { productVariantId: string; pricingMode: PricingMode; fixedPrice: number | null }[] }[]
  } | null
}
```

`400` khi: tên rỗng; `categoryId` không tồn tại; enum sai; không có biến thể; SKU rỗng hoặc **trùng** (toàn hệ thống, không phân biệt hoa/thường); giá không phải số nguyên ≥ 1; tồn kho không phải số nguyên ≥ 0; ảnh sai URL, quá 10 ảnh, nhiều hơn một ảnh đại diện, ảnh riêng trỏ biến thể không thuộc sản phẩm; tuỳ chọn trống tên/giá trị, trùng, mã màu không phải `#RRGGBB`; biến thể không chọn đúng một giá trị cho mỗi tuỳ chọn hoặc trùng tổ hợp; kích thước/khối lượng thiếu chiều hoặc không dương; `advancePaymentPercent` ngoài 0–100; **hàng dễ hỏng** (`isPerishable`) không phải `NO_RETURN` hoặc cọc dưới 50%; `giftBoxDetail` ở sản phẩm không phải hộp quà, `bundle` ở sản phẩm không phải set. Với `bundle`: thành phần/lựa chọn phải tồn tại, không phải set (không lồng set), đúng loại với vai trò (`BOX`→hộp quà, `PRODUCT`→sản phẩm lẻ, `ACCESSORY`→phụ kiện, `GREETING_CARD`→thiệp) hoặc loại nhóm; không trùng; tối đa một `BOX`; `min ≤ max`; nhóm `SINGLE` chọn tối đa 1; nhóm bắt buộc `min ≥ 1`; `FIXED_PRICE` bắt buộc có `fixedPrice ≥ 0`, các chế độ khác phải `null`. `AVAILABLE` mà tồn kho 0 được chuẩn hoá thành `OUT_OF_STOCK`. Ảnh: backend thật upload Cloudinary; mock lưu thẳng URL (`secureUrl = imageUrl`).

Mua được một biến thể khi sản phẩm **và** biến thể `AVAILABLE` và `stockQuantity > 0`. Storefront (`/products`) hiển thị `REGULAR`, `READY_MADE_GIFT_SET`, `READY_MADE_GIFT_BOX`, `PACKAGING_ACCESSORY` và `GREETING_CARD` có thể lọc theo loại; hộp/phụ kiện/thiệp cũng là thành phần của Gift Box Builder.

## 5. Địa chỉ — cần đăng nhập

- `GET /addresses` → `200 Address[]` của người dùng hiện tại, địa chỉ mặc định đứng đầu.
- `POST /addresses` — Body `{ recipientName, phone, addressLine, ward, district, city, isDefault }` → `201 Address`. `400` thiếu `recipientName`/`phone`/`addressLine`. Địa chỉ đầu tiên luôn là mặc định; đặt địa chỉ mới làm mặc định thì bỏ cờ ở các địa chỉ khác.

## 6. Hộp quà tùy chỉnh — cần đăng nhập

### `POST /gift-box-configs`
Body:
```json
{ "boxVariantId": "…", "items": [
  { "productVariantId": "…", "quantity": 2 },
  { "productVariantId": "…(thiệp)", "quantity": 1, "messageText": "Chúc mừng!", "messageRenderingMethod": "PRINTED" } ] }
```
→ `201 GiftBoxView`. Server **tự tính** giá và cờ miễn phí (không nhận `unitPrice`/`isComplimentary` từ client).

| Loại món | Cho phép | Giá trong hộp |
|---|---|---|
| `REGULAR` | khi `isCustomBoxEligible = true` | giá biến thể |
| `READY_MADE_GIFT_BOX` | có | giá biến thể |
| `PACKAGING_ACCESSORY` | có | **0** (miễn phí, vẫn trừ kho) |
| `GREETING_CARD` | có (có lời chúc) | giá biến thể |
| `READY_MADE_GIFT_SET` | **không** (không lồng set) | — |

`400` nếu: `boxVariantId` không thuộc `READY_MADE_GIFT_BOX` ("Hộp quà không hợp lệ"); không có món; biến thể trùng; món là set quà hoặc REGULAR không đủ điều kiện; số lượng không phải số nguyên ≥ 1; lời chúc > 200 ký tự hoặc gắn vào món không phải thiệp; **vượt sức chứa quá dung sai 20%** về khối lượng/thể tích ("Các món vượt quá xa sức chứa của hộp"); tổng số món > 30.
`409` nếu hộp hoặc món hết hàng/ngừng bán hoặc vượt tồn kho (nêu tên + biến thể và số còn lại).

**Vượt nhẹ (≤ 20%) vẫn được tạo** với `reviewStatus = PENDING` và `reviewNote` giải thích; khách thêm vào giỏ/đặt đơn bình thường, admin xem xét và liên hệ. Khách sửa được cho tới khi `APPROVED`. Hộp còn trống nhiều (< 35% sức chứa) chỉ là nhắc nhở ở FE, không chặn.

| Endpoint | Quyền | Mô tả |
|---|---|---|
| `GET /gift-box-configs/:id` | chủ sở hữu | `200 GiftBoxView` để mở lại chỉnh sửa; `404` nếu không phải của mình |
| `PUT /gift-box-configs/:id` | chủ sở hữu | Body như `POST` → `200 GiftBoxView`, kiểm tra lại toàn bộ; `PENDING/REJECTED` được sửa (REJECTED → tính lại trạng thái); `409` khi đã `APPROVED` hoặc đơn chứa hộp không còn `PENDING_CONFIRMATION`. Nếu đã đặt: hoàn/trừ lại kho và **chốt lại snapshot** đơn |
| `GET /admin/gift-box-requests` | ADMIN | `200 GiftBoxRequest[]` (chờ duyệt lên đầu): khách (kèm SĐT để liên hệ), hộp, lòng hộp/tải trọng, đơn liên quan |
| `PATCH /admin/gift-box-requests/:id` | ADMIN | Body `{ decision: 'APPROVED' \| 'REJECTED', note? }`; từ chối bắt buộc `note` (`400`) |

`PATCH /orders/:id/status` → `CONFIRMED` trả `409` nếu đơn có hộp tùy chỉnh chưa `APPROVED`/`NOT_REQUIRED`.

> Kiểm tra sức chứa chỉ là xấp xỉ: tổng thể tích bao ngoài là điều kiện *cần*, không *đủ* để xếp vừa. Mock chỉ từ chối khi chắc chắn không vừa.

## 7. Giỏ hàng — cần đăng nhập (mỗi người một giỏ, lưu trên server)

| Endpoint | Mô tả |
|---|---|
| `GET /cart` | `200 Cart`. Giỏ rỗng có `shippingFee = 0`, `requiredAdvanceAmount = 0` |
| `POST /cart/items` | `{ productVariantId, quantity, selections?: [{ bundleOptionId, quantity?, messageText?, messageRenderingMethod? }] }` **hoặc** `{ giftBoxConfigId, quantity: 1 }` → `200 Cart` |
| `PATCH /cart/items/:id` | `{ quantity }` → `200 Cart` |
| `DELETE /cart/items/:id` | → `200 Cart`; `404` nếu dòng không tồn tại |

Quy tắc:
- Số lượng nguyên ≥ 1 (`400`). Cùng biến thể + cùng `selections` (kể cả lời chúc) → cộng dồn; khác lựa chọn → dòng mới. Vượt tồn kho → `409`; biến thể không có/ngừng bán → `404`.
- `selections` chỉ hợp lệ với set quà: mỗi `bundleOptionId` phải thuộc set; mỗi nhóm tuân theo `selectionType`/min/max/`isRequired` (`400`); `quantity` của lựa chọn là 1; lời chúc ≤ 200 ký tự và chỉ cho thiệp, mặc định `HANDWRITTEN`.
- Giá dòng = giá biến thể + Σ `option.price` của lựa chọn: `FREE` → 0, `PRODUCT_PRICE` → giá biến thể của lựa chọn, `FIXED_PRICE` → `fixedPrice`.
- Chính sách dòng (server tính): `returnPolicy = NO_RETURN` nếu **bất kỳ** thành phần/lựa chọn nào `NO_RETURN`; `advancePaymentPercent` = tỷ lệ **cao nhất** trong các thành phần; `advanceAmount = round(subtotal × percent / 100)`.
- Hộp tùy chỉnh luôn số lượng 1 (`400` nếu khác), thêm trùng cùng cấu hình → `409`, cấu hình của người khác → `404`.
- `shippingFee` do server tính (mock: 30.000₫ cố định).

## 8. Đơn hàng

| Endpoint | Quyền |
|---|---|
| `GET /orders/mine` | đăng nhập — đơn của mình, mới nhất trước |
| `GET /orders` | ADMIN — mọi đơn |
| `POST /orders` | đăng nhập |
| `PATCH /orders/:id/status` | ADMIN |

### `POST /orders`
Body `{ "addressId": "…", "paymentMethod": "COD" | "BANK_TRANSFER" | "E_WALLET" | "CREDIT_CARD" | "DEBIT_CARD" }` (ngoài COD chỉ được mô phỏng) → `201 Order`. Đơn tạo **từ giỏ hàng của người dùng**.

1. `400` nếu phương thức sai, địa chỉ không tồn tại/không thuộc người dùng, giỏ trống, hoặc **giỏ có đặt cọc mà chọn `COD`** (quy tắc của mock, xem mục câu hỏi mở).
2. `409` nếu nhu cầu tồn kho vượt `stockQuantity` — **gộp theo biến thể** trên toàn đơn. Biến thể set quà trừ kho của chính nó cùng các lựa chọn thêm; thành phần cố định **không** bị trừ lần hai (tồn kho set là số set đã lắp sẵn). Hộp tùy chỉnh trừ hộp và từng món (kể cả phụ kiện miễn phí).
3. Một transaction: tạo `order` (`PENDING_CONFIRMATION`, `requiredAdvanceAmount`), `order_item` + `order_item_component` với **snapshot** (tên, SKU, thuộc tính biến thể, giá, chính sách, hạn dùng, tiền cọc, lời chúc), các `payment`; trừ kho; làm rỗng giỏ.
4. Thanh toán: không cọc → một `FULL_PAYMENT`; có cọc → `ADVANCE_PAYMENT` (= tổng cọc) + `REMAINING_PAYMENT` (= tổng − cọc), đều `PENDING`.

Sau khi đặt, đơn chỉ đọc snapshot — sửa giá/chính sách sản phẩm không làm đổi lịch sử.

### `PATCH /orders/:id/status`
Body `{ "status": … }` → `200 Order`. `404` không có đơn · `409` "Không thể chuyển đơn hàng sang trạng thái này".
Luồng hợp lệ:

| Từ | Tới |
|---|---|
| `PENDING_CONFIRMATION` | `CONFIRMED`, `CANCELLED` |
| `CONFIRMED` | `PROCESSING`, `CANCELLED` |
| `PROCESSING` | `PACKAGING`, `CANCELLED` |
| `PACKAGING` | `READY_TO_SHIP`, `CANCELLED` |
| `READY_TO_SHIP` | `SHIPPING` |
| `SHIPPING` | `DELIVERED`, `FAILED` |
| `DELIVERED` | `COMPLETED`, `RETURN_REQUESTED` |
| `RETURN_REQUESTED` | `RETURNED`, `COMPLETED` (từ chối trả hàng) |
| `COMPLETED`, `CANCELLED`, `RETURNED`, `FAILED` | — (trạng thái cuối) |

`409` khi chuyển sang `RETURN_REQUESTED` mà **mọi** dòng đều `NO_RETURN` (dùng snapshot, kể cả thành phần).

Hệ quả lên thanh toán:
- `CONFIRMED`: khoản `FULL_PAYMENT`/`ADVANCE_PAYMENT` không phải COD đang chờ → `PAID` (mô phỏng cổng thanh toán đã ghi nhận).
- `DELIVERED`/`COMPLETED`: mọi khoản còn chờ (phần còn lại, COD) → `PAID`.
- `CANCELLED`/`FAILED`/`RETURNED`: `PAID → REFUNDED`, `PENDING → FAILED`, và **hoàn lại tồn kho** (một lần).

## 9. Đánh giá

| Endpoint | Quyền |
|---|---|
| `GET /reviews/mine` | đăng nhập — đánh giá của mình (để biết nguồn mua nào đã đánh giá) |
| `POST /reviews` | đăng nhập |

`POST /reviews` body `{ orderItemId? | orderItemComponentId?, rating, title?, comment? }` → `201 Review`.
- Dòng sản phẩm lẻ / set quà / hộp quà bán riêng → `orderItemId`; sản phẩm nằm **trong** set hoặc hộp tùy chỉnh → `orderItemComponentId`. Đúng một nguồn (`400`).
- `rating` nguyên 1–5; `title` ≤ 255 ký tự (`400`). Nguồn không thuộc người dùng / không tồn tại → `404`.
- Chỉ đơn `DELIVERED`/`COMPLETED` (`409`); mỗi nguồn một lần (`409`); dòng không gắn sản phẩm cụ thể (hộp tùy chỉnh) → đánh giá từng món bên trong.
- `productId`/`productVariantId` lấy từ snapshot nguồn mua; điểm trung bình tính theo `productId`, gộp mọi biến thể. Không có bước duyệt. `review_image` chưa có giao diện.

## 10. Quản trị — thống kê, danh mục, khách hàng, đánh giá, tải ảnh (ADMIN)

| Endpoint | Mô tả |
|---|---|
| `GET /admin/dashboard` | KPI (doanh thu, đơn, khách, chờ xử lý), doanh thu theo ngày, đơn theo trạng thái, tồn kho thấp, đơn gần đây |
| `GET /admin/analytics?days=30` | Doanh thu theo ngày, sản phẩm bán chạy, doanh thu theo danh mục, khách chi tiêu nhiều, thống kê hộp tùy chỉnh |
| `POST /categories` · `PUT /categories/:id` · `DELETE /categories/:id` | Body `{ name, description }`; tên bắt buộc và không trùng; `409` khi xoá danh mục còn sản phẩm |
| `GET /admin/customers` | Khách kèm số đơn, tổng chi tiêu, đơn gần nhất |
| `PATCH /admin/customers/:id/status` | Body `{ status }` — khoá/mở khoá tài khoản |
| `GET /admin/reviews` · `DELETE /admin/reviews/:id` | Kiểm duyệt đánh giá |
| `POST /uploads` | `multipart/form-data` field `file` (ảnh ≤ giới hạn của `imageUpload`) → `201 { imageUrl, secureUrl, publicId }`. Mock trả data URL; backend thật đẩy lên Cloudinary. `ImageInput.imageUrl` nhận `http(s)://` hoặc ảnh đã tải lên |
