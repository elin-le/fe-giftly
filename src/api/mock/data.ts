import type { Address } from '@/features/addresses/types'
import type { RoleName, UserStatus } from '@/features/auth/types'
import type { Order, OrderItem, OrderItemComponent, Review } from '@/features/orders/types'
import type {
  BundleComponent,
  BundleOption,
  BundleOptionGroup,
  Category,
  ComponentRole,
  Dimensions,
  PricingMode,
  Product,
  ProductOption,
  ProductType,
  ProductVariant,
  ReturnPolicy,
  VariantPolicy,
} from '@/features/products/types'

/** UUID cố định cho dữ liệu mẫu để test và tài liệu có thể tham chiếu được. */
const seedId = (group: number, n: number): string =>
  `${String(group).padStart(8, '0')}-0000-4000-8000-${String(n).padStart(12, '0')}`

export const USER_IDS = {
  customer: seedId(1, 1),
  admin: seedId(1, 2),
  inactive: seedId(1, 3),
  suspended: seedId(1, 4),
} as const

export const CATEGORY_IDS = {
  birthday: seedId(4, 1),
  graduation: seedId(4, 2),
  anniversary: seedId(4, 3),
  boxes: seedId(4, 4),
  wrapping: seedId(4, 5),
  ribbon: seedId(4, 6),
  cards: seedId(4, 7),
  food: seedId(4, 8),
  gifts: seedId(4, 9),
} as const

export const ADDRESS_IDS = { home: seedId(3, 1), office: seedId(3, 2) } as const

export interface SeedUser {
  id: string
  email: string
  /** Chỉ dùng cho mock; backend thật lưu mật khẩu đã băm BCrypt. */
  password: string
  fullName: string
  phone: string | null
  status: UserStatus
  roles: RoleName[]
}

export const seedUsers: SeedUser[] = [
  { id: USER_IDS.customer, email: 'user@giftly.vn', password: 'User@123', fullName: 'Nguyễn Minh Anh', phone: '0901234567', status: 'ACTIVE', roles: ['ROLE_USER'] },
  { id: USER_IDS.admin, email: 'admin@giftly.vn', password: 'Admin@123', fullName: 'Quản trị Giftly', phone: null, status: 'ACTIVE', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
  { id: USER_IDS.inactive, email: 'inactive@giftly.vn', password: 'Inactive@123', fullName: 'Tài khoản ngừng hoạt động', phone: null, status: 'INACTIVE', roles: ['ROLE_USER'] },
  { id: USER_IDS.suspended, email: 'suspended@giftly.vn', password: 'Suspended@123', fullName: 'Tài khoản tạm khoá', phone: null, status: 'SUSPENDED', roles: ['ROLE_USER'] },
]

export type SeedAddress = Address & { userId: string }

export const seedAddresses: SeedAddress[] = [
  { id: ADDRESS_IDS.home, userId: USER_IDS.customer, recipientName: 'Nguyễn Minh Anh', phone: '0901234567', addressLine: '12 Lê Lợi', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true },
  { id: ADDRESS_IDS.office, userId: USER_IDS.customer, recipientName: 'Minh Anh (văn phòng)', phone: '0901234567', addressLine: '45 Nguyễn Huệ', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: false },
]


export const seedCategories: Category[] = [
  { id: CATEGORY_IDS.birthday, name: 'Sinh nhật', description: 'Hộp quà thiết kế sẵn cho ngày sinh nhật' },
  { id: CATEGORY_IDS.graduation, name: 'Tốt nghiệp', description: 'Hộp quà thiết kế sẵn cho ngày ra trường' },
  { id: CATEGORY_IDS.anniversary, name: 'Kỷ niệm', description: 'Hộp quà thiết kế sẵn cho ngày kỷ niệm' },
  { id: CATEGORY_IDS.boxes, name: 'Hộp quà', description: 'Hộp trống để tự thiết kế' },
  { id: CATEGORY_IDS.wrapping, name: 'Giấy gói', description: 'Giấy gói quà' },
  { id: CATEGORY_IDS.ribbon, name: 'Ruy băng', description: 'Ruy băng và dây trang trí' },
  { id: CATEGORY_IDS.cards, name: 'Thiệp', description: 'Thiệp chúc mừng' },
  { id: CATEGORY_IDS.food, name: 'Đồ ăn & trà', description: 'Bánh, trà và đồ ăn nhẹ' },
  { id: CATEGORY_IDS.gifts, name: 'Quà tặng & phụ kiện', description: 'Nến, sổ tay, nước hoa và phụ kiện' },
]


/** Mỗi sản phẩm có id nhóm 5; biến thể nhóm 11; giá trị tuỳ chọn nhóm 13 — cố định để test và tài liệu tham chiếu. */
export const PRODUCT_IDS = {
  setBirthdayPink: seedId(5, 1),
  setGraduation: seedId(5, 2),
  setAnniversary: seedId(5, 3),
  setBirthdaySage: seedId(5, 4),
  setHoliday: seedId(5, 5),
  boxClassic: seedId(5, 10),
  boxWood: seedId(5, 11),
  wrapKraft: seedId(5, 20),
  wrapFloral: seedId(5, 21),
  ribbonGold: seedId(5, 30),
  ribbonPurple: seedId(5, 31),
  cardHandwritten: seedId(5, 40),
  cardPopup: seedId(5, 41),
  candle: seedId(5, 50),
  tea: seedId(5, 51),
  cookies: seedId(5, 52),
  notebook: seedId(5, 53),
  pen: seedId(5, 54),
  perfume: seedId(5, 55),
  driedFlowers: seedId(5, 56),
} as const

export const VARIANT_IDS = {
  setBirthdayPinkS: seedId(11, 1),
  setBirthdayPinkL: seedId(11, 2),
  setGraduation: seedId(11, 3),
  setAnniversary: seedId(11, 4),
  setBirthdaySage: seedId(11, 5),
  setHoliday: seedId(11, 6),
  boxS: seedId(11, 10),
  boxM: seedId(11, 11),
  boxL: seedId(11, 12),
  boxWood: seedId(11, 13),
  wrapKraft: seedId(11, 20),
  wrapFloral: seedId(11, 21),
  ribbonGold: seedId(11, 30),
  ribbonPurple: seedId(11, 31),
  cardHandwritten: seedId(11, 40),
  cardPopup: seedId(11, 41),
  candle100: seedId(11, 50),
  candle200: seedId(11, 51),
  tea: seedId(11, 52),
  cookies: seedId(11, 53),
  notebookBrown: seedId(11, 54),
  notebookBlack: seedId(11, 55),
  pen: seedId(11, 56),
  perfume: seedId(11, 57),
  driedFlowers: seedId(11, 58),
} as const

/** Id nhóm tuỳ chọn của set quà và tuỳ chọn thiệp (để test chọn thiệp). */
export const BUNDLE_IDS = {
  pinkCardGroup: seedId(15, 1),
  pinkCardHandwritten: seedId(16, 1),
  pinkCardPopup: seedId(16, 2),
  anniversaryCardGroup: seedId(15, 2),
  anniversaryCardHandwritten: seedId(16, 3),
  anniversaryCardPopup: seedId(16, 4),
  sageAccessoryGroup: seedId(15, 3),
  sageWrapKraft: seedId(16, 5),
  sageWrapFloral: seedId(16, 6),
} as const

export const OPTION_IDS = {
  candleSize: seedId(12, 1),
  notebookColor: seedId(12, 2),
  boxSize: seedId(12, 3),
  setSize: seedId(12, 4),
} as const

const dim = (length: number, width: number, height: number): Dimensions => ({ length, width, height, unit: 'CM' })

/** Ràng buộc SQL: biến thể dễ hỏng phải NO_RETURN và đặt cọc tối thiểu 50%. */
const policy = (returnPolicy: ReturnPolicy | null, advance: number | null, isPerishable = false, shelfLifeHours: number | null = null): VariantPolicy => ({
  isPerishable,
  shelfLifeHours,
  returnPolicy,
  advancePaymentPercent: advance,
})

const RETURNABLE = policy('RETURNABLE', null)

const variant = (
  id: string,
  productId: string,
  sku: string,
  price: number,
  stockQuantity: number,
  extra: Partial<ProductVariant> = {},
): ProductVariant => ({
  id, productId, sku, price, stockQuantity, status: stockQuantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
  dimensions: null, weight: null, optionValueIds: [], policy: RETURNABLE, giftBoxDetail: null, bundle: null, ...extra,
})

const option = (id: string, name: string, order: number, values: [string, string, string?][]): ProductOption => ({
  id, name, displayOrder: order, values: values.map(([valueId, value, colorHex]) => ({ id: valueId, value, colorHex: colorHex ?? null })),
})

const OV = (n: number): string => seedId(13, n)

const product = (
  id: string,
  categoryId: string,
  name: string,
  description: string,
  productType: ProductType,
  variants: ProductVariant[],
  extra: Partial<Pick<Product, 'status' | 'isCustomBoxEligible' | 'options'>> = {},
): Product => ({
  id, categoryId, name, description, productType, status: 'AVAILABLE', isCustomBoxEligible: false,
  images: [], options: [], variants, ratingAverage: null, reviewCount: 0, ...extra,
})

const { birthday, graduation, anniversary, boxes, wrapping, ribbon, cards, food, gifts } = CATEGORY_IDS
const P = PRODUCT_IDS
const V = VARIANT_IDS
const B = BUNDLE_IDS

const component = (n: number, v: ProductVariant, role: ComponentRole, quantity = 1): BundleComponent => ({
  id: seedId(14, n), variantId: v.id, productId: v.productId, productName: '', optionLabel: null,
  componentRole: role, quantity, isRequired: true, policy: null,
})

const bundleOption = (id: string, v: ProductVariant, pricingMode: PricingMode, fixedPrice: number | null = null): BundleOption => ({
  id, variantId: v.id, productId: v.productId, productName: '', optionLabel: null, productType: 'REGULAR',
  pricingMode, fixedPrice, price: 0, stockQuantity: 0, policy: null,
})

const group = (
  id: string, name: string, groupType: BundleOptionGroup['groupType'], options: BundleOption[], isRequired = false,
): BundleOptionGroup => ({ id, name, displayOrder: 1, groupType, selectionType: 'SINGLE', minSelections: isRequired ? 1 : 0, maxSelections: 1, isRequired, options })

// --- Biến thể thành phần (dùng lại trong set và hộp) ---
const boxS = variant(V.boxS, P.boxClassic, 'BOX-S', 60000, 40, {
  optionValueIds: [OV(10)], dimensions: dim(16, 16, 9), weight: { value: 150, unit: 'G' },
  giftBoxDetail: { inner: dim(15, 15, 8), maxWeight: { value: 1.5, unit: 'KG' } },
})
const boxM = variant(V.boxM, P.boxClassic, 'BOX-M', 90000, 30, {
  optionValueIds: [OV(11)], dimensions: dim(23, 23, 11), weight: { value: 260, unit: 'G' },
  giftBoxDetail: { inner: dim(22, 22, 10), maxWeight: { value: 3, unit: 'KG' } },
})
const boxL = variant(V.boxL, P.boxClassic, 'BOX-L', 130000, 20, {
  optionValueIds: [OV(12)], dimensions: dim(31, 31, 13), weight: { value: 420, unit: 'G' },
  giftBoxDetail: { inner: dim(30, 30, 12), maxWeight: { value: 5, unit: 'KG' } },
})
const boxWood = variant(V.boxWood, P.boxWood, 'BOX-WOOD', 190000, 8, {
  dimensions: dim(26, 26, 12), weight: { value: 900, unit: 'G' },
  giftBoxDetail: { inner: dim(24, 24, 10), maxWeight: { value: 4, unit: 'KG' } },
})
const wrapKraft = variant(V.wrapKraft, P.wrapKraft, 'WRAP-KRAFT', 25000, 80)
const wrapFloral = variant(V.wrapFloral, P.wrapFloral, 'WRAP-FLORAL', 35000, 60)
const ribbonGold = variant(V.ribbonGold, P.ribbonGold, 'RIB-GOLD', 35000, 0)
const ribbonPurple = variant(V.ribbonPurple, P.ribbonPurple, 'RIB-PURPLE', 30000, 70)
const cardHand = variant(V.cardHandwritten, P.cardHandwritten, 'CARD-HAND', 45000, 120, { dimensions: dim(12, 17, 0.5), weight: { value: 20, unit: 'G' } })
const cardPopup = variant(V.cardPopup, P.cardPopup, 'CARD-POPUP', 65000, 50, { dimensions: dim(12, 17, 1), weight: { value: 30, unit: 'G' } })
const candle100 = variant(V.candle100, P.candle, 'CANDLE-100', 185000, 60, { optionValueIds: [OV(1)], dimensions: dim(8, 8, 9), weight: { value: 100, unit: 'G' } })
const candle200 = variant(V.candle200, P.candle, 'CANDLE-200', 295000, 30, { optionValueIds: [OV(2)], dimensions: dim(9, 9, 11), weight: { value: 200, unit: 'G' } })
const tea = variant(V.tea, P.tea, 'TEA-HERBAL', 85000, 50, { dimensions: dim(10, 7, 10), weight: { value: 120, unit: 'G' }, policy: policy('RETURNABLE', null, false, 8760) })
const cookies = variant(V.cookies, P.cookies, 'COOKIE-BUTTER', 95000, 40, { dimensions: dim(15, 10, 6), weight: { value: 300, unit: 'G' }, policy: policy('NO_RETURN', 50, true, 336) })
const notebookBrown = variant(V.notebookBrown, P.notebook, 'NOTE-BROWN', 120000, 25, { optionValueIds: [OV(3)], dimensions: dim(15, 21, 2), weight: { value: 250, unit: 'G' } })
const notebookBlack = variant(V.notebookBlack, P.notebook, 'NOTE-BLACK', 120000, 12, { optionValueIds: [OV(4)], dimensions: dim(15, 21, 2), weight: { value: 250, unit: 'G' } })
const pen = variant(V.pen, P.pen, 'PEN-ENGRAVED', 150000, 3, { dimensions: dim(15, 4, 3), weight: { value: 60, unit: 'G' } })
const perfume = variant(V.perfume, P.perfume, 'PERFUME-10', 210000, 15, { dimensions: dim(5, 5, 12), weight: { value: 100, unit: 'G' }, policy: policy('NO_RETURN', null) })
const driedFlowers = variant(V.driedFlowers, P.driedFlowers, 'FLOWER-DRY', 75000, 0, { dimensions: dim(10, 10, 20), weight: { value: 80, unit: 'G' } })

const cardGroup = (groupId: string, handId: string, popupId: string): BundleOptionGroup =>
  group(groupId, 'Thiệp chúc mừng', 'GREETING_CARD', [bundleOption(handId, cardHand, 'FREE'), bundleOption(popupId, cardPopup, 'FIXED_PRICE', 20000)])

const setVariant = (id: string, productId: string, sku: string, price: number, stock: number, components: BundleComponent[], optionGroups: BundleOptionGroup[], extra: Partial<ProductVariant> = {}) =>
  variant(id, productId, sku, price, stock, { bundle: { components, optionGroups }, ...extra })

const setPink = (id: string, sku: string, price: number, stock: number, valueId: string, candle: ProductVariant, boxVariant: ProductVariant) =>
  setVariant(id, P.setBirthdayPink, sku, price, stock,
    [component(1, boxVariant, 'BOX'), component(2, candle, 'PRODUCT'), component(3, cookies, 'PRODUCT'), component(4, wrapKraft, 'ACCESSORY')],
    [cardGroup(B.pinkCardGroup, B.pinkCardHandwritten, B.pinkCardPopup)], { optionValueIds: [valueId] })

/** Dữ liệu gốc; tên/giá/tồn kho của thành phần bundle được suy ra khi đọc (xem `catalogView.ts`). */
const seedProductsBase: Product[] = [
  product(P.setBirthdayPink, birthday, 'Set quà Sinh nhật Hồng Phấn', 'Nến thơm, bánh quy bơ và giấy gói kraft trong hộp giấy cứng; chọn thêm thiệp.', 'READY_MADE_GIFT_SET', [
    setPink(V.setBirthdayPinkS, 'SET-PINK-S', 450000, 24, OV(20), candle100, boxS),
    setPink(V.setBirthdayPinkL, 'SET-PINK-L', 690000, 10, OV(21), candle200, boxM),
  ], { options: [option(OPTION_IDS.setSize, 'Kích cỡ', 1, [[OV(20), 'Nhỏ'], [OV(21), 'Lớn']])] }),
  product(P.setGraduation, graduation, 'Set quà Tốt nghiệp Ngày Mới', 'Sổ da, bút khắc tên và nến thơm, trọn vẹn cho ngày ra trường.', 'READY_MADE_GIFT_SET', [
    setVariant(V.setGraduation, P.setGraduation, 'SET-GRAD', 520000, 15,
      [component(5, boxM, 'BOX'), component(6, notebookBrown, 'PRODUCT'), component(7, pen, 'PRODUCT'), component(8, candle100, 'PRODUCT')], []),
  ]),
  product(P.setAnniversary, anniversary, 'Set quà Kỷ niệm Hai Ta', 'Nước hoa mini, nến thơm; thiệp viết tay là lựa chọn bắt buộc.', 'READY_MADE_GIFT_SET', [
    setVariant(V.setAnniversary, P.setAnniversary, 'SET-ANNIV', 780000, 9,
      [component(9, boxWood, 'BOX'), component(10, perfume, 'PRODUCT'), component(11, candle200, 'PRODUCT')],
      [group(B.anniversaryCardGroup, 'Thiệp chúc mừng', 'GREETING_CARD', [bundleOption(B.anniversaryCardHandwritten, cardHand, 'FREE'), bundleOption(B.anniversaryCardPopup, cardPopup, 'PRODUCT_PRICE')], true)]),
  ]),
  product(P.setBirthdaySage, birthday, 'Set quà Sinh nhật Xanh Sage', 'Trà thảo mộc, bánh quy và nến mini; chọn giấy gói tặng kèm.', 'READY_MADE_GIFT_SET', [
    setVariant(V.setBirthdaySage, P.setBirthdaySage, 'SET-SAGE', 390000, 18,
      [component(12, boxS, 'BOX'), component(13, tea, 'PRODUCT'), component(14, cookies, 'PRODUCT')],
      [group(B.sageAccessoryGroup, 'Giấy gói', 'PACKAGING_ACCESSORY', [bundleOption(B.sageWrapKraft, wrapKraft, 'FREE'), bundleOption(B.sageWrapFloral, wrapFloral, 'FREE')])]),
  ]),
  product(P.setHoliday, anniversary, 'Set quà Mùa Lễ', 'Bộ sưu tập mùa lễ đã ngừng bán.', 'READY_MADE_GIFT_SET', [
    variant(V.setHoliday, P.setHoliday, 'SET-HOLIDAY', 650000, 5, { status: 'DISCONTINUED' }),
  ], { status: 'DISCONTINUED' }),

  product(P.boxClassic, boxes, 'Hộp quà Giftly', 'Hộp giấy cứng nắp rời, ba cỡ; dùng làm hộp chứa khi tự thiết kế.', 'READY_MADE_GIFT_BOX', [boxS, boxM, boxL], {
    options: [option(OPTION_IDS.boxSize, 'Cỡ hộp', 1, [[OV(10), 'S'], [OV(11), 'M'], [OV(12), 'L']])],
  }),
  product(P.boxWood, boxes, 'Hộp gỗ Sồi', 'Hộp gỗ sồi có nắp trượt, chắc chắn và dùng lại được.', 'READY_MADE_GIFT_BOX', [boxWood]),
  product(P.wrapKraft, wrapping, 'Giấy kraft nâu', 'Giấy kraft dày, mộc mạc.', 'PACKAGING_ACCESSORY', [wrapKraft]),
  product(P.wrapFloral, wrapping, 'Giấy hoa nhí', 'Giấy gói họa tiết hoa nhí pastel.', 'PACKAGING_ACCESSORY', [wrapFloral]),
  product(P.ribbonGold, ribbon, 'Dây ruy băng Satin Vàng', 'Ruy băng satin vàng mật ong, bản rộng 2.5cm.', 'PACKAGING_ACCESSORY', [ribbonGold], { status: 'OUT_OF_STOCK' }),
  product(P.ribbonPurple, ribbon, 'Ruy băng lụa tím', 'Ruy băng lụa màu tím mận, dài 2m.', 'PACKAGING_ACCESSORY', [ribbonPurple]),
  product(P.cardHandwritten, cards, 'Thiệp viết tay Giftly', 'Thiệp giấy mỹ thuật, viết tay lời chúc theo yêu cầu.', 'GREETING_CARD', [cardHand]),
  product(P.cardPopup, cards, 'Thiệp pop-up', 'Thiệp nổi 3D, mở ra là bất ngờ.', 'GREETING_CARD', [cardPopup]),

  product(P.candle, gifts, 'Nến thơm Hoa Nhài', 'Nến sáp đậu nành, cháy sạch, lưu hương 40 giờ.', 'REGULAR', [candle100, candle200], {
    isCustomBoxEligible: true, options: [option(OPTION_IDS.candleSize, 'Dung tích', 1, [[OV(1), '100g'], [OV(2), '200g']])],
  }),
  product(P.tea, food, 'Trà thảo mộc', 'Trà hoa cúc và táo đỏ, 10 túi lọc.', 'REGULAR', [tea], { isCustomBoxEligible: true }),
  product(P.cookies, food, 'Bánh quy bơ', 'Bánh quy bơ nướng thủ công, hộp 12 cái. Hàng dễ hỏng: đặt cọc 50%, không đổi trả.', 'REGULAR', [cookies], { isCustomBoxEligible: true }),
  product(P.notebook, gifts, 'Sổ da bìa mềm', 'Sổ tay giấy kem, bìa da khâu tay.', 'REGULAR', [notebookBrown, notebookBlack], {
    isCustomBoxEligible: true, options: [option(OPTION_IDS.notebookColor, 'Màu bìa', 1, [[OV(3), 'Nâu', '#7A5230'], [OV(4), 'Đen', '#2A2A2A']])],
  }),
  product(P.pen, gifts, 'Bút khắc tên', 'Bút bi kim loại, khắc tên theo yêu cầu.', 'REGULAR', [pen], { isCustomBoxEligible: true }),
  product(P.perfume, gifts, 'Nước hoa mini', 'Chai 10ml hương gỗ và hoa nhài. Không đổi trả sau khi mở hộp.', 'REGULAR', [perfume], { isCustomBoxEligible: true }),
  product(P.driedFlowers, gifts, 'Hoa khô nhỏ', 'Bó hoa khô phối sẵn, giữ màu lâu.', 'REGULAR', [driedFlowers], { status: 'OUT_OF_STOCK' }),
]

/** Ảnh minh hoạ vẽ bằng SVG (emoji + gradient) để dữ liệu mẫu có hình mà không cần mạng; backend thật dùng ảnh Cloudinary. */
const artImage = (id: string, emoji: string, from: string, to: string): Product['images'][number] => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<rect width="400" height="400" fill="url(#g)"/><circle cx="330" cy="70" r="90" fill="#fff" fill-opacity=".18"/>` +
    `<circle cx="60" cy="350" r="110" fill="#fff" fill-opacity=".14"/>` +
    `<text x="200" y="250" font-size="170" text-anchor="middle">${emoji}</text></svg>`
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  return { id: seedId(18, Number(id.slice(-4))), imageUrl: url, secureUrl: url, publicId: `seed/${id.slice(-4)}`, isThumbnail: true, productVariantId: null }
}

const ART: Record<string, [string, string, string]> = {
  [PRODUCT_IDS.setBirthdayPink]: ['🎂', '#f3c2d1', '#e59ab4'],
  [PRODUCT_IDS.setGraduation]: ['🎓', '#cfd8f2', '#9aa8e0'],
  [PRODUCT_IDS.setAnniversary]: ['💝', '#f2c9c9', '#d98a9b'],
  [PRODUCT_IDS.setBirthdaySage]: ['🎁', '#cfe6dc', '#8fc3ae'],
  [PRODUCT_IDS.setHoliday]: ['🎄', '#d4e6d0', '#9cc79a'],
  [PRODUCT_IDS.boxClassic]: ['📦', '#f4e3ad', '#e7c25c'],
  [PRODUCT_IDS.boxWood]: ['🪵', '#e8d3b8', '#c9a479'],
  [PRODUCT_IDS.wrapKraft]: ['📜', '#e8d9c0', '#c9b08a'],
  [PRODUCT_IDS.wrapFloral]: ['🌸', '#f6d6e0', '#e8a9c0'],
  [PRODUCT_IDS.ribbonGold]: ['🎀', '#f4e3ad', '#e0b43a'],
  [PRODUCT_IDS.ribbonPurple]: ['🎀', '#ddd5f2', '#a998dc'],
  [PRODUCT_IDS.cardHandwritten]: ['💌', '#f6d6e0', '#d99ab1'],
  [PRODUCT_IDS.cardPopup]: ['🎴', '#ddd5f2', '#b3a2e6'],
  [PRODUCT_IDS.candle]: ['🕯️', '#f4e3ad', '#e9c36b'],
  [PRODUCT_IDS.tea]: ['🍵', '#cfe6dc', '#93c7ae'],
  [PRODUCT_IDS.cookies]: ['🍪', '#f1dcbc', '#d9ae75'],
  [PRODUCT_IDS.notebook]: ['📔', '#e3d2c0', '#b8946f'],
  [PRODUCT_IDS.pen]: ['🖋️', '#d6dbe8', '#9aa6c4'],
  [PRODUCT_IDS.perfume]: ['🧴', '#e6d8f0', '#bd9fd6'],
  [PRODUCT_IDS.driedFlowers]: ['💐', '#f6d8d2', '#e0a597'],
}

export const seedProducts: Product[] = seedProductsBase.map((p) => {
  const art = ART[p.id]
  return art ? { ...p, images: [artImage(p.id, ...art)] } : p
})


const customer = { id: USER_IDS.customer, fullName: 'Nguyễn Minh Anh', email: 'user@giftly.vn' }
const homeAddress = { id: ADDRESS_IDS.home, recipientName: 'Nguyễn Minh Anh', phone: '0901234567', addressLine: '12 Lê Lợi', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true }
const officeAddress = { id: ADDRESS_IDS.office, recipientName: 'Minh Anh (văn phòng)', phone: '0901234567', addressLine: '45 Nguyễn Huệ', ward: 'Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: false }

const findVariant = (variantId: string) => {
  for (const p of seedProducts) {
    const v = p.variants.find((candidate) => candidate.id === variantId)
    if (v) return { product: p, variant: v }
  }
  throw new Error(`Seed variant not found: ${variantId}`)
}

const attributesOf = (variantId: string): Record<string, string> | null => {
  const { product: p, variant: v } = findVariant(variantId)
  const attrs: Record<string, string> = {}
  for (const o of p.options) {
    const val = o.values.find((candidate) => v.optionValueIds.includes(candidate.id))
    if (val) attrs[o.name] = val.value
  }
  return Object.keys(attrs).length > 0 ? attrs : null
}

const seedComponent = (
  n: number, variantId: string, role: ComponentRole, quantity: number, unitPrice: number,
  extra: Partial<OrderItemComponent> = {},
): OrderItemComponent => {
  const { product: p, variant: v } = findVariant(variantId)
  return {
    id: seedId(9, n), productVariantId: variantId, productId: p.id, componentRole: role,
    productNameSnapshot: p.name, skuSnapshot: v.sku, variantSnapshot: attributesOf(variantId),
    quantity, unitPrice, isComplimentary: unitPrice === 0, messageText: null, messageRenderingMethod: null,
    returnPolicySnapshot: v.policy?.returnPolicy ?? null, advancePaymentPercentSnapshot: v.policy?.advancePaymentPercent ?? null,
    isPerishableSnapshot: v.policy?.isPerishable ?? null, shelfLifeHoursSnapshot: v.policy?.shelfLifeHours ?? null,
    ...extra,
  }
}

const seedLineItem = (n: number, variantId: string, quantity: number): OrderItem => {
  const { product: p, variant: v } = findVariant(variantId)
  return {
    id: seedId(7, n), productVariantId: variantId, productId: p.id, giftBoxConfigId: null, itemNameSnapshot: p.name,
    skuSnapshot: v.sku, variantSnapshot: attributesOf(variantId), unitPrice: v.price, quantity, subtotal: v.price * quantity,
    returnPolicySnapshot: v.policy?.returnPolicy ?? 'RETURNABLE', advancePaymentPercentSnapshot: v.policy?.advancePaymentPercent ?? null,
    isPerishableSnapshot: v.policy?.isPerishable ?? null, shelfLifeHoursSnapshot: v.policy?.shelfLifeHours ?? null,
    requiredAdvanceAmount: null, components: [],
  }
}

const pinkSet: OrderItem = {
  id: seedId(7, 1), productVariantId: V.setBirthdayPinkS, productId: P.setBirthdayPink, giftBoxConfigId: null,
  itemNameSnapshot: 'Set quà Sinh nhật Hồng Phấn', skuSnapshot: 'SET-PINK-S', variantSnapshot: { 'Kích cỡ': 'Nhỏ' },
  unitPrice: 450000, quantity: 2, subtotal: 900000, returnPolicySnapshot: 'NO_RETURN', advancePaymentPercentSnapshot: 50, isPerishableSnapshot: true, shelfLifeHoursSnapshot: 336, requiredAdvanceAmount: 450000,
  components: [
    seedComponent(1, V.boxS, 'BOX', 1, 0, { isComplimentary: false }),
    seedComponent(2, V.candle100, 'PRODUCT', 1, 0, { isComplimentary: false }),
    seedComponent(3, V.cookies, 'PRODUCT', 1, 0, { isComplimentary: false }),
    seedComponent(4, V.wrapKraft, 'ACCESSORY', 1, 0),
    seedComponent(5, V.cardHandwritten, 'GREETING_CARD', 1, 0, { messageText: 'Chúc mừng sinh nhật con!', messageRenderingMethod: 'HANDWRITTEN' }),
  ],
}

const customBox: OrderItem = {
  id: seedId(7, 2), productVariantId: null, productId: null, giftBoxConfigId: seedId(10, 1),
  itemNameSnapshot: 'Hộp quà tùy chỉnh', skuSnapshot: null, variantSnapshot: null,
  unitPrice: 425000, quantity: 1, subtotal: 425000, returnPolicySnapshot: 'RETURNABLE', advancePaymentPercentSnapshot: null, isPerishableSnapshot: false, shelfLifeHoursSnapshot: null, requiredAdvanceAmount: null,
  components: [
    seedComponent(11, V.boxM, 'BOX', 1, 90000),
    seedComponent(12, V.wrapKraft, 'ACCESSORY', 1, 0),
    seedComponent(13, V.cardHandwritten, 'GREETING_CARD', 1, 45000, { messageText: 'Chúc mừng sinh nhật!', messageRenderingMethod: 'HANDWRITTEN' }),
    seedComponent(14, V.tea, 'PRODUCT', 2, 85000),
    seedComponent(15, V.notebookBrown, 'PRODUCT', 1, 120000),
  ],
}

const notebookItem = seedLineItem(3, V.notebookBrown, 1)
const candleItem = seedLineItem(4, V.candle200, 1)

export const seedOrders: Order[] = [
  {
    id: seedId(6, 1), userId: USER_IDS.customer, customer, address: homeAddress, orderNumber: 'GFT-0001',
    subtotal: 900000, shippingFee: 30000, totalAmount: 930000, requiredAdvanceAmount: 450000,
    status: 'PENDING_CONFIRMATION', orderedAt: '2026-11-10T09:15:00.000Z', items: [pinkSet],
    payments: [
      { id: seedId(8, 1), paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PENDING', paymentStage: 'ADVANCE_PAYMENT', amount: 450000, paidAt: null },
      { id: seedId(8, 2), paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PENDING', paymentStage: 'REMAINING_PAYMENT', amount: 480000, paidAt: null },
    ],
  },
  {
    id: seedId(6, 2), userId: USER_IDS.customer, customer, address: officeAddress, orderNumber: 'GFT-0002',
    subtotal: 425000, shippingFee: 30000, totalAmount: 455000, requiredAdvanceAmount: null,
    status: 'SHIPPING', orderedAt: '2026-11-08T14:40:00.000Z', items: [customBox],
    payments: [{ id: seedId(8, 3), paymentMethod: 'BANK_TRANSFER', paymentStatus: 'PAID', paymentStage: 'FULL_PAYMENT', amount: 455000, paidAt: '2026-11-08T14:45:00.000Z' }],
  },
  {
    id: seedId(6, 3), userId: USER_IDS.customer, customer, address: homeAddress, orderNumber: 'GFT-0003',
    subtotal: 415000, shippingFee: 30000, totalAmount: 445000, requiredAdvanceAmount: null,
    status: 'COMPLETED', orderedAt: '2026-10-28T08:00:00.000Z', items: [notebookItem, candleItem],
    payments: [{ id: seedId(8, 4), paymentMethod: 'COD', paymentStatus: 'PAID', paymentStage: 'FULL_PAYMENT', amount: 445000, paidAt: '2026-11-01T10:00:00.000Z' }],
  },
]

export const seedReviews: Review[] = [
  {
    id: seedId(17, 1), userId: USER_IDS.customer, userName: 'Nguyễn Minh Anh', productId: P.notebook, productVariantId: V.notebookBrown,
    orderItemId: notebookItem.id, orderItemComponentId: null, rating: 5, title: 'Bìa da mềm, giấy đẹp',
    comment: 'Giấy kem dày, viết rất êm tay. Rất hợp làm quà tặng.', createdAt: '2026-11-03T09:00:00.000Z',
  },
]
