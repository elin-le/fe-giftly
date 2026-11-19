# Hướng dẫn cài đặt & phát triển

## Yêu cầu
- Node.js ≥ 22, npm ≥ 10
- (Sau này) JDK 21 + PostgreSQL cho backend

## Cài đặt & chạy

```bash
npm install
cp .env.example .env.development   # đã có sẵn khi khởi tạo
npm run dev                         # http://localhost:5173
```

Mặc định `VITE_USE_MOCK=true` → dùng backend giả lập, **không cần Spring Boot**. Dữ liệu mock nằm trong bộ nhớ và trở về ban đầu mỗi lần tải lại trang.

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_BASE_URL` | URL backend, vd. `http://localhost:8080/api` |
| `VITE_USE_MOCK` | `true` dùng mock; `false`/bỏ trống gọi backend thật |

## Tài khoản demo (mock)
| Vai trò | Email | Mật khẩu |
|---|---|---|
| Khách hàng | `user@giftly.vn` | `User@123` |
| Quản trị viên | `admin@giftly.vn` | `Admin@123` |
| Tạm khoá (để thử lỗi) | `suspended@giftly.vn` | `Suspended@123` |
| Ngừng hoạt động (để thử lỗi) | `inactive@giftly.vn` | `Inactive@123` |

Có thể tự đăng ký tài khoản mới ở `/register` (chỉ sống trong bộ nhớ, mất khi tải lại trang).

## Các trang
| Đường dẫn | Quyền | Nội dung |
|---|---|---|
| `/` | công khai | Trang chủ |
| `/products` | công khai | Cửa hàng (tìm kiếm, lọc danh mục); thêm vào giỏ cần đăng nhập |
| `/builder` | công khai | Gift Box Builder; thêm vào giỏ cần đăng nhập |
| `/signin`, `/register` | công khai | Đăng nhập / đăng ký |
| `/cart`, `/checkout`, `/orders` | đăng nhập | Giỏ hàng, thanh toán, đơn của tôi |
| `/admin/products`, `/admin/orders` | `ROLE_ADMIN` | Quản lý sản phẩm / đơn hàng (MUI) |

## Lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Dev server |
| `npm test` | Chạy toàn bộ test |
| `npm run test:watch` | Test chế độ theo dõi |
| `npm run test:coverage` | Test + báo cáo coverage |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm run lint` | Oxlint |
| `npm run build` | Typecheck + build production vào `dist/` |
| `npm run snapshot` | Sinh `PROJECT_SNAPSHOT.md` cho AI (thêm `-- --check` để chạy typecheck + test) |

Trước khi commit: `npm run typecheck && npm test && npm run build`.

## Thêm component shadcn/ui
Đã có `components.json` (alias `@/components`, CSS ở `src/styles/index.css`):
```bash
npx shadcn@latest add select
```
Sau khi thêm: thay màu cứng bằng token (`bg-background`, `text-foreground`…), kiểm tra dark mode và 360px.

## Làm việc với AI/Agent
1. Đưa cho AI đọc `AGENTS.md` và `PROJECT_SNAPSHOT.md` (chạy `npm run snapshot` trước).
2. Yêu cầu AI tuân thủ 10 nguyên tắc trong `AGENTS.md`.
3. Sau thay đổi lớn: chạy lại snapshot.

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| `TS5090: Non-relative paths are not allowed` | `paths` trong `tsconfig.app.json` phải có tiền tố `./` (`"@/*": ["./src/*"]`) — yêu cầu của TypeScript 7 |
| MUI báo `Property 'fontWeight' does not exist` | MUI v9 bỏ system props; dùng `sx={{ fontWeight: 700 }}` |
| Số hiển thị sai font | Kiểm tra đường dẫn `url(...)` trong `src/styles/fonts.css` trỏ tới `lora-latin-wght-normal.woff2` |
| Dev server chậm khi import icon MUI | Import theo đường dẫn riêng: `@mui/icons-material/Menu`, không import từ barrel |
| Dialog Radix cảnh báo thiếu `Description` | Mỗi `DialogContent` cần `DialogTitle` + `DialogDescription` |
