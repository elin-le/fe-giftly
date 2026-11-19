# Đặc tả yêu cầu phần mềm (SRS) — Giftly

> Trạng thái: **bản nháp v0.2** (đã cập nhật theo schema DB 27 bảng: biến thể, set quà, đặt cọc, snapshot, đánh giá) — dựa trên đề cương “Design and Development of a Personalized Gift E-commerce Website”. Cần xác nhận phạm vi với giảng viên hướng dẫn.

## 1. Giới thiệu

### 1.1 Mục đích
Mô tả yêu cầu chức năng và phi chức năng của **Giftly**, website thương mại điện tử kinh doanh quà tặng cá nhân hóa.

### 1.2 Bài toán
- Khó tìm được set quà phù hợp với từng dịp.
- Khách muốn tự chọn thành phần nhưng chưa có công cụ trực quan.
- Khó kiểm soát tổng chi phí khi kết hợp nhiều sản phẩm.
- Cửa hàng cần quản lý sản phẩm, đơn hàng và yêu cầu cá nhân hóa.

### 1.3 Giải pháp
Một website tập trung sản phẩm, có hai cách mua:
- **Ready-made Gifts**: set quà lắp sẵn theo dịp (sinh nhật, tốt nghiệp, kỷ niệm…), có thể chọn thêm thiệp/phụ kiện; ngoài ra có sản phẩm lẻ và hộp quà bán riêng.
- **Custom Gifts (Gift Box Builder)**: khách tự chọn hộp, sản phẩm, phụ kiện, thiệp/lời chúc và xem tổng giá.

### 1.4 Đối tượng sử dụng
| Vai trò | Mô tả |
|---|---|
| Khách vãng lai | Xem sản phẩm, tìm kiếm, thiết kế thử hộp quà; **chưa thêm được vào giỏ** — phải đăng ký / đăng nhập |
| Khách hàng (đã đăng nhập) | Như trên + đặt hàng, xem lịch sử và trạng thái đơn |
| Quản trị viên | Quản lý sản phẩm, danh mục, khách hàng, đơn hàng, xem thống kê |

## 2. Yêu cầu chức năng

Cột **FE** thể hiện trạng thái phía frontend hiện tại (dùng mock API): ✅ đã có · 🚧 một phần · ⏳ chưa làm.

### 2.1 Khách hàng
| ID | Yêu cầu | Ưu tiên | FE |
|---|---|---|---|
| FR-01 | Đăng ký / đăng nhập / đăng xuất; tài khoản tạm khoá / ngừng hoạt động không đăng nhập được | Cao | ✅ |
| FR-02 | Xem danh sách sản phẩm, lọc theo danh mục và loại; trang chi tiết `/products/:id` chọn biến thể (màu, cỡ…), xem giá/tồn kho/chính sách/đánh giá | Cao | ✅ |
| FR-03 | Tìm kiếm sản phẩm theo tên | Cao | ✅ |
| FR-04 | Giỏ hàng **lưu trên server theo tài khoản**: thêm biến thể (kèm lựa chọn của set quà), đổi số lượng (không vượt tồn kho), xoá. **Phải đăng nhập** mới thêm vào giỏ (sản phẩm lẫn hộp tùy chỉnh) | Cao | ✅ |
| FR-05 | Thanh toán: chọn / thêm **địa chỉ giao hàng** (kiểm tra họ tên, SĐT VN, địa chỉ) và phương thức thanh toán; đơn có đặt cọc không dùng COD | Cao | ✅ |
| FR-06 | Hộp thoại xác nhận đơn hàng trước khi gửi | Cao | ✅ |
| FR-07 | Đặt hàng, nhận mã đơn | Cao | ✅ |
| FR-08 | Xem lịch sử mua và trạng thái đơn | Trung bình | ✅ |
| FR-09 | Thanh toán — chọn COD, chuyển khoản, ví điện tử, thẻ tín dụng/ghi nợ (ngoài COD chỉ mô phỏng); một đơn có nhiều `payment` theo giai đoạn (toàn bộ, đặt cọc, phần còn lại) | Trung bình | ✅ |
| FR-09b | Đánh giá sản phẩm đã mua (đơn đã giao/hoàn thành) theo dòng đơn hoặc từng món trong set/hộp; hiển thị điểm trung bình và danh sách đánh giá ở trang chi tiết | Trung bình | ✅ |
| FR-09c | Hiển thị chính sách trước khi mua: không đổi trả, hàng dễ hỏng, tỷ lệ + số tiền đặt cọc (giỏ, thanh toán, đơn hàng) | Cao | ✅ |

### 2.2 Gift Box Builder (tính năng trọng tâm)
| ID | Yêu cầu | Ưu tiên | FE |
|---|---|---|---|
| FR-10 | Chọn hộp chứa (biến thể của `READY_MADE_GIFT_BOX`, xem kích thước lòng hộp và tải trọng) | Cao | ✅ |
| FR-11 | Chọn món đưa vào hộp (sản phẩm `REGULAR` đủ điều kiện; kiểm tra tồn kho và **sức chứa** theo khối lượng + thể tích với thanh mức đầy) | Cao | ✅ |
| FR-12 | Chọn phụ kiện đóng gói (miễn phí) và thiệp (tuỳ chọn); mỗi thiệp có lời chúc và cách thể hiện viết tay/in | Cao | ✅ |
| FR-13 | Xem tổng giá và cấu hình hộp quà trước khi đặt | Cao | ✅ |
| FR-14 | Đưa hộp quà tùy chỉnh vào giỏ / đơn hàng (cần đăng nhập) | Cao | ✅ |
| FR-15 | Vượt sức chứa nhẹ (≤ 20%) vẫn cho thêm vào giỏ, đánh dấu chờ admin duyệt; khách **sửa được tới khi admin duyệt**; chọn quá ít món so với thể tích hộp (< 35%) thì nhắc | Cao | ✅ |
| FR-16 | Trang chủ hiển thị danh mục và sản phẩm hot trong tháng; thông tin liên hệ Zalo/Facebook người bán | Cao | ✅ |

### 2.3 Quản trị viên
| ID | Yêu cầu | Ưu tiên | FE |
|---|---|---|---|
| FR-20 | CRUD sản phẩm: tên, mô tả, danh mục, loại (sản phẩm lẻ / set quà / hộp quà / phụ kiện đóng gói / thiệp), trạng thái, cờ cho phép vào hộp tùy chỉnh và **các biến thể** (SKU, giá, tồn kho, trạng thái, kích thước, khối lượng, chính sách đổi trả / đặt cọc / hạn dùng, lòng hộp và tải trọng với hộp quà), **ảnh** (chung hoặc riêng từng biến thể), **tuỳ chọn** (màu, cỡ…) và **thành phần / nhóm tuỳ chọn của set quà**; kiểm tra theo ràng buộc DB (hàng dễ hỏng phải không đổi trả và cọc ≥ 50%) | Cao | ✅ |
| FR-21 | Quản lý danh mục (thêm/sửa/xoá, đếm sản phẩm) | Trung bình | ✅ |
| FR-22 | Xem danh sách đơn hàng và chi tiết đơn (snapshot thành phần, chính sách, các khoản thanh toán) | Cao | ✅ |
| FR-23 | Cập nhật trạng thái đơn theo quy tắc chuyển hợp lệ (xem 2.4) | Cao | ✅ |
| FR-24 | Quản lý khách hàng (tìm kiếm, chi tiêu, khoá/mở khoá) và đánh giá (kiểm duyệt) | Trung bình | ✅ |
| FR-25 | Dashboard (KPI, doanh thu, cảnh báo cần xử lý) và Analytics (sản phẩm bán chạy, doanh thu theo danh mục, khách VIP, hộp tùy chỉnh) | Trung bình | ✅ |
| FR-26 | Danh sách sản phẩm dạng **cha → biến thể** (bấm hàng cha để xem biến thể đầy đủ thuộc tính), hàng xen kẽ màu, giá in đậm; thêm ảnh bằng **URL hoặc tải từ thiết bị** | Cao | ✅ |
| FR-27 | Trang **Yêu cầu hộp quà**: hộp tùy chỉnh vượt kích thước trong dung sai được làm nổi bật; admin xem khách/đơn, liên hệ (Zalo), duyệt hoặc từ chối kèm lý do | Cao | ✅ |

### 2.4 Quy tắc nghiệp vụ
- **Tồn kho theo biến thể**: không cho thêm vào giỏ / đặt quá số lượng tồn; biến thể hết hàng hoặc ngừng bán không được mua. Backend **phải** kiểm tra lại khi tạo đơn (FE chỉ là lớp hỗ trợ). Phụ kiện miễn phí vẫn trừ kho; set quà trừ kho của set (đã lắp sẵn) và các lựa chọn thêm, không trừ lại thành phần cố định.
- **Giá**: tính bằng VND, số nguyên, do **backend** tính theo ngữ cảnh (phụ kiện trong set/hộp = 0; thiệp theo `pricing_mode`). Sau khi đặt, đơn chỉ đọc **snapshot** (tên, SKU, thuộc tính, giá, chính sách) — không tính lại từ giá hiện tại.
- **Trạng thái đơn**:
  `PENDING_CONFIRMATION → CONFIRMED → PROCESSING → PACKAGING → READY_TO_SHIP → SHIPPING → DELIVERED → COMPLETED`; có thể `CANCELLED` trước khi giao cho vận chuyển, `FAILED` khi giao thất bại, `RETURN_REQUESTED → RETURNED` khi trả hàng. Huỷ / giao thất bại / trả hàng hoàn lại tồn kho. `COMPLETED`, `CANCELLED`, `RETURNED`, `FAILED` là trạng thái cuối.
- **Xác thực & phân quyền**: JWT; vai trò `ROLE_USER` / `ROLE_ADMIN`; tài khoản `SUSPENDED`/`INACTIVE` không đăng nhập được; `/cart`, `/checkout`, `/orders` cần đăng nhập, `/admin` cần `ROLE_ADMIN`.
- **Chính sách tổng hợp** (set quà, hộp tùy chỉnh): có thành phần `NO_RETURN` → cả dòng không đổi trả; tỷ lệ đặt cọc = cao nhất trong các thành phần. Tiền cọc = làm tròn(thành tiền dòng × tỷ lệ). Đơn có cọc tách `ADVANCE_PAYMENT` + `REMAINING_PAYMENT`; không dùng COD.
- **Hộp quà tùy chỉnh**: giá = hộp + Σ (giá món × số lượng), phụ kiện = 0; không đưa set quà vào hộp; sản phẩm `REGULAR` cần `is_custom_box_eligible`; tổng khối lượng/thể tích vượt sức chứa tới 20% vẫn được thêm nhưng ở trạng thái chờ admin duyệt (không thể xác nhận đơn khi chưa duyệt), vượt hơn thì từ chối; tối đa 30 món; lời chúc ≤ 200 ký tự (xem `use-cases.md`).
- **Đánh giá**: chỉ đơn `DELIVERED`/`COMPLETED` của chính người dùng; mỗi nguồn mua một lần; điểm trung bình theo sản phẩm gộp mọi biến thể.
- **Số điện thoại**: định dạng di động VN `0xxxxxxxxx` hoặc `+84xxxxxxxxx`.

## 3. Yêu cầu phi chức năng

| ID | Nhóm | Yêu cầu |
|---|---|---|
| NFR-01 | Giao diện | Phong cách minimalist; bảng màu `#E5EAE2`, `#3A0F34`, `#EAAA00`, không dùng màu thuần |
| NFR-02 | Responsive | Mobile-first, hoạt động tốt từ 360px |
| NFR-03 | Chế độ tối | Chuyển ban ngày/ban đêm, ghi nhớ lựa chọn |
| NFR-04 | Typography | Playfair Display cho chữ, Lora cho số |
| NFR-05 | Trải nghiệm | Chuyển động mượt, tôn trọng `prefers-reduced-motion` |
| NFR-06 | Truy cập | Nhãn ARIA cho nút biểu tượng, lỗi form gắn với ô nhập |
| NFR-07 | Chất lượng | Mọi logic có test; strict TypeScript |
| NFR-08 | Bảo mật | Mật khẩu băm ở BE, API quản trị yêu cầu vai trò ADMIN (Spring Security) |
| NFR-09 | Khả năng bảo trì | Cấu trúc feature-based, tài liệu `docs/` luôn cập nhật |

## 4. Ràng buộc & ngoài phạm vi

- Công nghệ: React + TypeScript (FE); Java 21, Spring Boot, PostgreSQL (BE).
- **Ngoài phạm vi** (chỉ nghiên cứu nếu còn thời gian): thanh toán trực tuyến thật, gợi ý quà tặng, quản lý tồn kho nâng cao.

## 5. Kết quả mong đợi
Website có các luồng cơ bản (xem sản phẩm, tạo hộp quà, đặt hàng, quản lý đơn); tài liệu phân tích, use case, thiết kế CSDL, hướng dẫn sử dụng; hiểu quy trình phát triển web từ phân tích đến kiểm thử.
