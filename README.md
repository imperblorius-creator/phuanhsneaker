# PhuAnh Sneaker - Hệ Thống Thương Mại Điện Tử & Quản Trị Cửa Hàng Sneaker

Website thương mại điện tử chuyên cung cấp các dòng giày sneaker chính hãng: **Onitsuka Tiger**, **Jordan JD**, **Nike & SB58**, **MLB Korea**, **Louis Vuitton**, **Puma**, **Adidas Samba**, **New Balance**, **Vans**, **Balenciaga**, **Gucci**,... với hệ thống Full-stack hoàn chỉnh: xử lý đơn hàng, giỏ hàng, mã giảm giá, kiểm soát tồn kho biến thể, và Trang quản trị Admin Panel.

---

## I. TÀI KHOẢN MẪU KHỞI TẠO (DEMO ACCOUNTS)

Hệ thống được khởi tạo sẵn các tài khoản thử nghiệm với tính năng 1-click tự động điền trong modal đăng nhập:

### 1. Tài khoản Quản trị viên (ADMIN)
- **Email:** `admin@phuanhsneaker.local`
- **Mật khẩu:** `Admin@123456`
- **Quyền hạn:** Toàn quyền truy cập **Admin Panel** (Dashboard, Quản lý sản phẩm, Quản lý kho hàng & đối soát, Xử lý đơn hàng, Quản lý khách hàng, Khuyến mãi, Cài đặt giao diện, Xuất báo cáo CSV).

### 2. Tài khoản Khách hàng (CUSTOMER)
- **Email:** `customer@gmail.com`
- **Mật khẩu:** `Customer@123`
- **Quyền hạn:** Mua hàng, chọn size, áp dụng mã ưu đãi, theo dõi lịch sử đơn hàng, hủy đơn đang chờ xử lý, cập nhật địa chỉ giao hàng.

*(Người dùng mới đăng ký qua form sẽ luôn có vai trò `CUSTOMER` mặc định nhằm bảo vệ an toàn cho trang quản trị).*

---

## II. TÍNH NĂNG CHÍNH

### 1. Dành cho Khách hàng (Storefront)
- **Trang chủ:** Hero banner carousel tự động chuyển slide, menu mega dropdown, brand ribbon tương tác, lưới sản phẩm mới và nổi bật.
- **Danh mục & Tìm kiếm:** Lọc đa tầng theo thương hiệu, khoảng giá (<450k, 450k-480k, >480k), size giày (35 đến 44), tình trạng còn hàng; sắp xếp theo mới nhất, giá tăng/giảm, tên A-Z; tìm kiếm tức thì theo tên hoặc mã SKU.
- **Chi tiết sản phẩm:** Thư viện ảnh thu nhỏ chuyển ảnh mượt mà, kiểm tra số lượng tồn kho từng size, chọn size trước khi đặt hàng, số lượng mua, sản phẩm liên quan cùng dòng.
- **Giỏ hàng & Đặt hàng:** Quản lý dòng sản phẩm độc lập theo từng size/màu, áp dụng mã giảm giá (`PHUANH50`, `SNEAKER10`), tính phí ship (miễn phí cho đơn từ 1.000.000₫).
- **Thanh toán:** COD, Chuyển khoản Vietcombank (STK: `0397233999`, Chủ TK: `PHUANH SNEAKER`), Thẻ quốc tế/Ví điện tử. Chống tạo đơn trùng khi bấm nhiều lần.
- **Tài khoản cá nhân:** Xem lịch sử mua hàng, chi tiết đơn, trạng thái xử lý, hủy đơn khi còn ở trạng thái `pending`.

### 2. Dành cho Quản trị viên (Admin Panel)
- **Dashboard:** Doanh thu hôm nay, tuần này, tháng này, năm nay; biểu đồ doanh thu 7 ngày; cảnh báo sản phẩm sắp hết hàng (<5 đôi) và hết hàng; danh sách sản phẩm bán chạy nhất.
- **Quản lý sản phẩm:** Thêm, sửa, xóa sản phẩm; tạo biến thể size với số lượng tồn riêng; quản lý ảnh và mã SKU.
- **Quản lý kho (Inventory):** Theo dõi tồn kho theo SKU biến thể; thực hiện Nhập kho, Xuất kho, Điều chỉnh với lý do và người thực hiện; lưu nhật ký biến động kho (Audit Log); ngăn tồn kho âm; xuất CSV.
- **Quản lý đơn hàng:** Quy trình xử lý đơn (`pending` -> `confirmed` -> `shipping` -> `completed` -> `cancelled`); cập nhật mã vận đơn và đơn vị vận chuyển; ghi chú nội bộ; in hóa đơn; tự động hoàn kho khi hủy đơn (chống hoàn kho 2 lần).
- **Quản lý khách hàng:** Danh sách khách hàng, tổng đơn, tổng chi tiêu; khóa/mở khóa tài khoản; ghi chú chăm sóc khách hàng.
- **Khuyến mãi (Coupons):** Tạo mã giảm giá theo số tiền hoặc phần trăm; điều kiện đơn tối thiểu; giới hạn số lượt sử dụng; bật/tắt mã.
- **Giao diện & Cài đặt:** Quản lý slide banner trang chủ, hotline, email, thông báo đầu trang, thông tin tài khoản ngân hàng.
- **Báo cáo:** Thống kê doanh thu, tỷ lệ hủy đơn, xuất dữ liệu đơn hàng và tồn kho ra file CSV.

---

## III. CẤU TRÚC DỰ ÁN

```text
├── data/
│   └── store.json                   # Cơ sở dữ liệu JSON bền vững (tự động lưu khi có thao tác)
├── src/
│   ├── components/
│   │   ├── BrandRibbon.tsx          # Dải thương hiệu Onitsuka Tiger, JD, Nike,...
│   │   ├── CheckoutModal.tsx        # Modal thanh toán 2 bước & kiểm tra tồn kho
│   │   ├── FeaturesBar.tsx          # 4 cam kết dịch vụ khách hàng
│   │   ├── Footer.tsx               # Footer chuẩn nhận diện PhuAnh Sneaker
│   │   ├── Header.tsx               # Announcement bar, logo, mega menu, search, user menu
│   │   ├── HeroCarousel.tsx         # Banner slider trang chủ
│   │   ├── LoginModal.tsx           # Modal đăng nhập / đăng ký có sẵn nút thử nhanh
│   │   ├── OrderSuccessModal.tsx    # Modal xác nhận đặt hàng thành công & thông tin chuyển khoản
│   │   └── ProductCard.tsx          # Thẻ sản phẩm sneaker
│   ├── context/
│   │   ├── AuthContext.tsx          # Quản lý phiên đăng nhập & phân quyền RBAC
│   │   ├── CartContext.tsx          # Quản lý giỏ hàng & tính toán tiền
│   │   └── NotificationContext.tsx  # Hệ thống thông báo Toast nổi
│   ├── data/
│   │   └── initialProducts.ts       # 46 mẫu giày sneaker ban đầu từ giao diện mẫu
│   ├── pages/
│   │   ├── AccountView.tsx          # Trang hồ sơ & lịch sử đơn hàng của khách
│   │   ├── AdminView.tsx            # Trang quản trị Admin Panel 9 phân hệ
│   │   ├── CollectionView.tsx       # Trang danh mục & bộ lọc sản phẩm
│   │   ├── HomeView.tsx             # Trang chủ
│   │   └── ProductDetailView.tsx    # Trang chi tiết sản phẩm & chọn size
│   ├── services/
│   │   ├── api.ts                   # Client API gọi các endpoint backend
│   │   └── firebase.ts              # Adapter Firebase Firestore & Auth
│   ├── types/
│   │   └── index.ts                 # Định nghĩa TypeScript domain models
│   ├── App.tsx                      # Root component điều hướng SPA
│   ├── index.css                    # Cấu hình Tailwind CSS & màu sắc thương hiệu
│   └── main.tsx                     # Entry point React
├── firebase-blueprint.json          # Schema blueprint Firestore IR
├── firestore.rules                  # Quy tắc bảo mật Firestore Rules 8 trụ cột
├── server.ts                        # Express backend tích hợp Vite middleware (Port 3000)
├── package.json
└── tsconfig.json
```

---

## IV. TÍCH HỢP FIREBASE & DỊCH VỤ BÊN NGOÀI

1. **Cloud Firestore & Firebase Auth**:
   - Tệp quy tắc bảo mật `firestore.rules` và lược đồ `firebase-blueprint.json` đã được tạo hoàn chỉnh.
   - Khi cấu hình Firebase trong môi trường production, chỉ cần cung cấp tệp `firebase-applet-config.json` hoặc biến môi trường `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID` vào `src/services/firebase.ts`.
   - Trong quá trình phát triển cục bộ và dev container, Express backend tự động đóng vai trò là backend đáng tin cậy (Trusted Backend) lưu trữ vào `data/store.json` để toàn bộ chức năng (đặt hàng, thanh toán, kiểm soát kho, đăng nhập, admin panel) hoạt động 100% trơn tru không lỗi.

2. **Cổng thanh toán thẻ / Ví điện tử**:
   - Hiện hỗ trợ COD và Chuyển khoản ngân hàng (Vietcombank).
   - Với cổng thanh toán như VNPay, MoMo hoặc Stripe, hệ thống đã thiết kế sẵn trường `paymentStatus` và mã giao dịch để dễ dàng kích hoạt callback/webhook khi có thông tin API key của đối tác.

---

## V. CÁCH CHẠY VÀ TRIỂN KHAI

### Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
*(Khởi chạy Express server tích hợp Vite middlewares trên cổng 3000)*

### Kiểm tra cú pháp TypeScript & Linting
```bash
npm run lint
```

### Build bản phát hành (Production)
```bash
npm run build
npm start
```
