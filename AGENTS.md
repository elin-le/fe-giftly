# AGENTS.md — Nguyên tắc làm việc cho AI/Agent

> Đọc file này **trước khi viết bất kỳ dòng code nào** trong dự án Giftly (frontend).
> Để nắm nhanh trạng thái hiện tại của dự án, đọc `PROJECT_SNAPSHOT.md` (tạo bằng `npm run snapshot`) thay vì tự quét toàn bộ mã nguồn.

## 0. Bối cảnh dự án

**Giftly** là website thương mại điện tử quà tặng cá nhân hóa (đồ án chuyên ngành). Hai cách mua sắm: **Ready-made Gifts** (hộp quà thiết kế sẵn theo dịp) và **Custom Gifts** (khách tự chọn hộp, sản phẩm, phụ kiện, lời chúc — *Gift Box Builder*).

| Hạng mục | Công nghệ |
|---|---|
| Build / Ngôn ngữ | Vite, React 19, TypeScript (strict) |
| Storefront UI | Tailwind CSS v4, shadcn/ui (Radix), Lucide React, Motion (`motion/react`) |
| Admin Dashboard | MUI (`@mui/material`, `@mui/x-data-grid`) — **chỉ** dùng trong `features/admin` |
| State | Zustand |
| Gọi API | Axios (`src/api/client.ts`) |
| Form | React Hook Form + Zod |
| Test | Vitest + Testing Library |
| Backend (dự kiến) | Java 21, Spring Boot, PostgreSQL |

Ngôn ngữ giao diện: **tiếng Việt**. Code, tên biến, tên file: **tiếng Anh**. Comment giải thích *vì sao*: tiếng Việt hoặc tiếng Anh đều được, nhưng nhất quán trong một file.

---

## 1. Component hóa — không gom mọi thứ vào một chỗ

- Mỗi component **một trách nhiệm**. Nếu một file component vượt khoảng **150 dòng** hoặc có hơn một lý do để thay đổi → tách ra.
- Tách theo ba lớp, không trộn lẫn:
  - **Presentational component**: nhận props, render UI, không gọi API.
  - **Hook** (`hooks/`): chứa logic, trạng thái cục bộ, gọi API.
  - **Page** (`pages/`): ghép hook + component, không chứa markup chi tiết.
- Logic nghiệp vụ thuần (tính tiền, quy tắc chuyển trạng thái, validate) viết thành **hàm thuần** trong file riêng để dễ test.
- Không lồng JSX quá 3–4 cấp; khi cần, đặt tên và tách component con.
- Component UI dùng chung nằm ở `src/components/ui` (kiểu shadcn). Thêm component shadcn mới bằng `npx shadcn@latest add <name>` (đã có `components.json`) rồi chỉnh theo design tokens bên dưới.

## 2. Code phải đi kèm test

- **Mọi** logic mới (hook, store, hàm thuần, schema validate, component có tương tác) phải có test cùng thư mục: `Foo.tsx` → `Foo.test.tsx`.
- Test phải bao phủ **đường chính + trường hợp biên + trường hợp lỗi** (rỗng, 0, âm, `NaN`, chuỗi toàn khoảng trắng, API lỗi, hết hàng…).
- Test mô tả **hành vi người dùng thấy** (query theo role/label), không test chi tiết cài đặt.
- Mock ở ranh giới hệ thống (module `*Api`), không mock nội bộ component.
- Sửa bug → viết test tái hiện bug **trước**, rồi mới sửa.
- Trước khi báo hoàn thành, **phải** chạy và qua cả ba: `npm run typecheck`, `npm test`, `npm run build`.

## 3. Cấu trúc Feature-based (thống nhất)

```
src/
├── app/                    # router, providers cấp ứng dụng
├── api/                    # axios client, ApiError, mock backend (dev)
├── components/
│   ├── ui/                 # primitive dùng chung (shadcn)
│   └── layout/             # header, tab bar, layout cấp trang
├── features/
│   └── <feature>/
│       ├── api/            # hàm gọi endpoint của feature
│       ├── components/     # component riêng của feature
│       ├── hooks/          # hook riêng của feature
│       ├── pages/          # trang (route element)
│       ├── <name>Store.ts  # Zustand store (nếu cần)
│       └── types.ts        # kiểu dữ liệu của feature
├── lib/                    # tiện ích thuần, không phụ thuộc feature
├── stores/                 # store dùng chung toàn app (vd. theme)
├── styles/                 # Tailwind, design tokens, fonts
└── test/                   # setup test
```

Quy tắc phụ thuộc:
- `features/A` **không** import trực tiếp từ nội bộ của `features/B` ngoài `types`, `api` hoặc store được export có chủ đích. Dùng chung nhiều → đưa lên `lib/` hoặc `components/`.
- Ngoại lệ có chủ đích: `features/gift-builder/{types,constants,giftBox,componentRole,fit}.ts` (vai trò thành phần suy từ `product_type`, sức chứa hộp) và `features/products/{types,productRules,policy}.ts` (biến thể, chính sách tổng hợp) là kiểu/hằng số/hàm thuần được `cart`, `orders`, `admin` và mock dùng chung; `features/orders/{types,orderRules}.ts` được `cart`, `admin` và mock dùng; `features/addresses/{types,formatAddress}.ts` được `checkout`, `orders`, `admin` dùng; `stores/authStore` dùng toàn app.
- `components/` và `lib/` **không** import từ `features/`. (Ngoại lệ đã có: `components/layout` dùng badge giỏ hàng — giữ ngoại lệ ở mức tối thiểu.)
- MUI **chỉ** xuất hiện trong `features/admin`. Storefront dùng Tailwind + shadcn.
- Luôn dùng alias `@/` thay cho đường dẫn tương đối dài (`../../..`).

## 4. Clean code & đúng trong mọi trường hợp (predictable)

- Ngắn gọn **không** có nghĩa là bỏ qua trường hợp biên. Trước khi xong, tự hỏi: *input rỗng? âm? quá lớn? `undefined`? double-click? mạng chậm/lỗi? hai request chồng nhau?*
- Hàm **thuần, nhỏ, một việc**; cùng input → cùng output. Tránh side effect ẩn và biến toàn cục.
- Tên rõ nghĩa (`selectCartTotal`, `getNextStatuses`), không viết tắt khó hiểu. Hàm là động từ, boolean bắt đầu bằng `is/has/can`.
- Không `any`. Không `as` để “dập” lỗi kiểu (chỉ dùng ở ranh giới đã được kiểm chứng). Bật `strict` + `noUncheckedIndexedAccess`.
- Dữ liệu từ ngoài (API, form, localStorage) **phải được validate/ép kiểu** ở ranh giới (Zod, `toApiError`).
- Không để code chết, `console.log`, comment thừa. Không copy-paste: lặp lần thứ ba thì trừu tượng hóa.
- Trạng thái bất đồng bộ phải xử lý đủ **loading / lỗi / rỗng / thành công**, và chống race condition (xem `useAsync`).
- Thao tác ghi (đặt hàng, xoá…) phải **chặn gửi lặp** (disable nút khi đang gửi) và hiển thị lỗi cho người dùng bằng thông điệp tiếng Việt thân thiện.

## 5. Tài liệu dự án `docs/`

```
docs/
├── requirements/
│   ├── SRS.md                  # đặc tả yêu cầu phần mềm
│   └── use-cases.md
├── architecture/
│   ├── system-architecture.md
│   ├── database-design.md
│   └── diagrams/
├── api/
│   └── api-specification.md    # hợp đồng FE ↔ BE (mock backend phải khớp)
└── development/
    └── setup-guide.md
```

- Thay đổi **chức năng** → cập nhật `SRS.md` / `use-cases.md`.
- Thay đổi **endpoint, payload, kiểu dữ liệu** → cập nhật `api-specification.md` **và** `src/api/mock`.
- Thay đổi **cấu trúc/thư viện/lệnh chạy** → cập nhật `system-architecture.md` / `setup-guide.md`.
- Tài liệu cập nhật **trong cùng thay đổi** với code, không để “làm sau”.

## 6. Snapshot trạng thái dự án cho AI

- Chạy `npm run snapshot` (hoặc `bash scripts/snapshot.sh`) để sinh `PROJECT_SNAPSHOT.md`: stack, cây thư mục, routes, features, test, TODO, biến môi trường.
- `bash scripts/snapshot.sh --check` chạy thêm typecheck + test và ghi kết quả vào snapshot.
- Khi bắt đầu phiên làm việc mới: **đọc `AGENTS.md` + `PROJECT_SNAPSHOT.md` trước**, chỉ đọc sâu file cụ thể khi cần.
- Kết thúc một đợt thay đổi lớn: chạy lại snapshot.

## 7. Typography

- **Chữ**: *Playfair Display* (`@fontsource-variable/playfair-display`, có subset tiếng Việt).
- **Số**: *Lora* — serif, số dạng lining dễ đọc, hòa hợp nét với Playfair. (Playfair mặc định dùng số kiểu cũ nên giá tiền khó đọc.)
- Cơ chế: `@font-face 'Giftly Digits'` trong `src/styles/fonts.css` chỉ chứa dải ký tự `0-9 , .` bằng `unicode-range`, nên **số tự động hiển thị bằng Lora ở mọi nơi**. Không cần gắn class cho từng con số.
- Luôn dùng `font-sans` / `font-serif` của Tailwind (đều trỏ tới stack này). **Không** khai báo font khác.

## 8. Readability

- Một file — một mục đích. Thứ tự trong file: import → hằng số → kiểu → component/hàm chính → hàm phụ.
- Nhóm import: thư viện ngoài → alias `@/` → tương đối. Không import thừa.
- Class Tailwind dài: sắp theo nhóm (layout → spacing → typography → màu → trạng thái); dùng `cn()` và `cva` cho biến thể thay vì nối chuỗi.
- Hằng số/“magic number” đặt tên rõ ở đầu file hoặc `types.ts`.
- Comment trả lời câu hỏi **“vì sao”**, không nhắc lại “cái gì” mà code đã nói.

## 9. Màu sắc & layout — Minimalist

Không dùng màu thuần (`#fff`, `#000`, `white`, `black`, `bg-white`, `text-black`…). Chỉ dùng token (Tailwind: `bg-background`, `text-foreground`, `bg-primary`…); không hard-code hex trong component.

| Token | Ban ngày | Ban đêm | Vai trò |
|---|---|---|---|
| `background` | `#E5EAE2` | `#190A16` | Nền trang |
| `surface` / `surface-raised` | `#F1F4EE` / `#F7F9F4` | `#25101F` / `#301629` | Thẻ, ô nhập |
| `foreground` | `#2A0B26` | `#E5EAE2` | Chữ chính |
| `primary` | `#3A0F34` | `#EAAA00` | Nút chính, nhấn mạnh |
| `accent` | `#EAAA00` | `#EAAA00` | Điểm nhấn, CTA phụ |

- Palette gốc: `#E5EAE2`, `#3A0F34`, `#EAAA00`. Muốn điều chỉnh để hài hòa hơn thì sửa **token** trong `src/styles/index.css` (và `muiTheme.ts` cho Admin), không sửa rải rác.
- Layout: nhiều khoảng trắng, bo góc lớn (`rounded-card`, `rounded-full`), bóng nhẹ, tối đa 1–2 màu nhấn trên một màn hình.
- **Chế độ ban đêm** do `useThemeStore` (Zustand, lưu `localStorage`) điều khiển bằng class `dark` trên `<html>`. Mọi màu mới **phải** có cặp sáng/tối.
- Điểm khác biệt hiện tại: thanh điều hướng nổi dạng viên thuốc (desktop) và dock nổi ở đáy màn hình (mobile).

## 10. Responsive Mobile-first (bắt buộc)

- Viết style cho **mobile trước**, rồi mở rộng bằng `sm:` `md:` `lg:`. Không dùng `max-width` để “vá” desktop.
- Thiết kế cho chiều rộng **360px** trở lên; không có cuộn ngang ngoài ý muốn.
- Vùng chạm tối thiểu **40×40px**; ô nhập cao ≥ 44px; font ô nhập ≥ 14px.
- Dùng `min-h-dvh` thay `100vh`; chừa chỗ cho dock đáy (`pb-28 md:pb-16`).
- Modal trên mobile là *bottom sheet*, trên desktop là hộp thoại giữa màn hình (xem `components/ui/dialog.tsx`).
- Mọi tính năng mới phải kiểm tra ở 360px, 768px, 1280px.

---

## Animation (Motion)

- Dùng `motion/react`. Chuyển động **mượt, ngắn (0.2–0.6s)**, easing mềm `[0.22, 1, 0.36, 1]` hoặc spring; không giật, không chói.
- Dùng để **giải thích thay đổi** (xuất hiện, đổi trạng thái, chuyển trang) chứ không để trang trí thừa.
- Tôn trọng `prefers-reduced-motion` (đã có reset toàn cục trong CSS).
- Danh sách xuất hiện dùng stagger; phần tử bị xoá dùng `AnimatePresence`; chỉ báo tab dùng `layoutId`.

## Giao tiếp FE ↔ BE (Axios)

- **Chỉ** dùng `apiClient` từ `src/api/client.ts`; không tạo instance Axios khác, không gọi `fetch` trực tiếp.
- Mỗi feature có `api/<name>Api.ts` bọc endpoint thành hàm có kiểu. Component **không** gọi `apiClient` trực tiếp.
- Mọi lỗi đã được chuẩn hóa thành `ApiError` (có `message` tiếng Việt, `status`). UI chỉ cần `toApiError(err).message`.
- **Dữ liệu bám thiết kế DB** (`docs/architecture/database-design.md`): khoá UUID, enum viết hoa (`AVAILABLE`, `PENDING_CONFIRMATION`, `COD`…), tên trường camelCase của cột DB. Giá, tồn kho, SKU nằm ở **biến thể** (`product_variant`); giỏ, hộp tùy chỉnh và đơn tham chiếu `productVariantId`, đơn chỉ đọc **snapshot**. Giỏ hàng nằm trên server và cần đăng nhập; đừng lưu giỏ ở `localStorage`. Server tính giá/miễn phí/chính sách — FE không gửi `unitPrice`.
- Phát triển khi chưa có Spring Boot: `VITE_USE_MOCK=true` bật backend giả lập (`src/api/mock`). Mock **phải khớp** `docs/api/api-specification.md`.

## Quy trình làm một thay đổi

1. Đọc `AGENTS.md` + `PROJECT_SNAPSHOT.md`.
2. Xác định feature; nếu chưa có thì tạo thư mục theo cấu trúc ở mục 3.
3. Viết test (hoặc test + code song song), code theo nguyên tắc 1, 4, 8.
4. Kiểm tra responsive (mục 10) và dark mode (mục 9).
5. `npm run typecheck && npm test && npm run build`.
6. Cập nhật `docs/` (mục 5) rồi chạy `npm run snapshot`.

## Lệnh thường dùng

```bash
npm run dev          # chạy dev server (mặc định dùng mock API)
npm test             # chạy toàn bộ test
npm run typecheck    # kiểm tra kiểu
npm run build        # typecheck + build production
npm run snapshot     # sinh PROJECT_SNAPSHOT.md cho AI
```
