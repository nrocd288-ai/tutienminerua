# Túc Mệnh Cốc — Web cho thuê treo máy tu luyện

Website giới thiệu dịch vụ + quản lý đăng ký, đăng nhập, đơn hàng và nạp tiền
qua QR chuyển khoản (xác nhận thủ công bởi admin).

## Tính năng

- Đăng ký / đăng nhập tài khoản (mật khẩu được mã hoá, không lưu dạng thô)
- Bảng giá thuê theo ngày (1 / 7 / 15 / 30 ngày) — chỉnh trong `src/lib/config.js`
- Tạo mã QR chuyển khoản chuẩn VietQR tự điền đúng số tiền + nội dung theo từng đơn hàng
- Khách tự báo "đã chuyển khoản", admin vào trang riêng để xác nhận
- Khi admin xác nhận, số ngày treo máy tự động cộng vào tài khoản khách
- Trang trạng thái hiển thị số ngày còn lại, ngày hết hạn

## Lưu trữ dữ liệu — Upstash Redis (bắt buộc khi deploy lên Vercel)

Vercel chạy code ở môi trường serverless — **không ghi được file vào ổ đĩa**,
nên bản này lưu toàn bộ user/đơn hàng vào Redis qua dịch vụ Upstash
(miễn phí, không cần thẻ tín dụng).

**Cách cài (làm 1 lần, mất khoảng 2 phút):**

1. Vào project của bạn trên Vercel Dashboard.
2. Vào tab **Storage** → **Create Database** → chọn **Upstash** → chọn **Redis**.
3. Đặt tên bất kỳ (ví dụ `tutien-db`) → chọn vùng gần Việt Nam nhất (Singapore) → **Create**.
4. Vercel sẽ hỏi bạn muốn **Connect** database này vào project nào — chọn đúng project web của bạn.
5. Vercel tự thêm 2 biến môi trường `KV_REST_API_URL` và `KV_REST_API_TOKEN` —
   bạn không cần tự gõ, không cần biết giá trị.
6. Vào tab **Deployments** → bấm vào dấu `...` ở bản deploy gần nhất → **Redeploy**
   để áp dụng biến môi trường mới.

Sau bước này, đăng ký/đăng nhập/đơn hàng sẽ lưu lại vĩnh viễn, không mất khi server khởi động lại.

## Chạy thử ở máy của bạn

```bash
npm install
cp .env.local.example .env.local
# Mở .env.local, đổi JWT_SECRET và ADMIN_PASSWORD thành giá trị riêng của bạn
# Thêm KV_REST_API_URL và KV_REST_API_TOKEN lấy từ Upstash Console
# (https://console.upstash.com -> tạo database Redis free -> tab REST API)
npm run dev
```

Mở `http://localhost:3000` — trang chủ. Mở `http://localhost:3000/admin` — trang quản trị (đăng nhập bằng `ADMIN_PASSWORD` bạn đặt trong `.env.local`).

## Đổi thông tin ngân hàng nhận tiền

Mở file `src/lib/config.js`, sửa phần `BANK_INFO`:

```js
export const BANK_INFO = {
  bankBin: "970407",        // mã ngân hàng theo chuẩn Napas — đổi nếu không dùng Techcombank
  bankName: "Techcombank",
  accountNumber: "0123456789", // số tài khoản thật của bạn
  accountName: "NGUYEN VAN A",  // tên chủ tài khoản, KHÔNG dấu, viết hoa
};
```

Danh sách mã `bankBin` của các ngân hàng: https://api.vietqr.io/v2/banks

## Đổi bảng giá thuê theo ngày

Cũng trong `src/lib/config.js`, sửa mảng `RENTAL_PACKAGES` — thêm/sửa/xoá gói, đổi giá tuỳ ý.

## Đưa lên Vercel để có link thật (miễn phí)

1. Tạo tài khoản tại https://vercel.com (đăng nhập bằng GitHub là nhanh nhất).
2. Đẩy code này lên một repo GitHub (riêng tư hoặc công khai đều được).
3. Trong Vercel, chọn **Add New → Project**, chọn repo vừa tạo.
4. Ở phần **Environment Variables**, thêm 2 biến:
   - `JWT_SECRET` — một chuỗi bí mật ngẫu nhiên (gõ bừa 30-40 ký tự là được)
   - `ADMIN_PASSWORD` — mật khẩu bạn muốn dùng để vào `/admin`
5. Bấm **Deploy**. Sau khoảng 1 phút, Vercel cho bạn một link dạng
   `https://ten-project-cua-ban.vercel.app` — đây là link bạn gửi cho khách.

## Lưu ý quan trọng trước khi dùng thật

- **Đã cài Upstash Redis chưa?** Nếu chưa làm bước "Lưu trữ dữ liệu" ở trên,
  đăng ký/đăng nhập sẽ báo lỗi "Không tạo được tài khoản" — đây là lỗi thường gặp
  nhất, gần như chắc chắn do thiếu bước kết nối Redis.
- Đổi `JWT_SECRET` và `ADMIN_PASSWORD` trước khi đưa cho người khác dùng —
  đừng giữ giá trị mẫu trong `.env.local.example`.
- Đây là xác nhận thanh toán thủ công (bạn tự bấm "Xác nhận" sau khi
  kiểm tra đã nhận tiền) — chưa tự động đối soát với ngân hàng. Muốn tự động
  hoàn toàn thì cần tích hợp thêm dịch vụ webhook ngân hàng (ví dụ Casso,
  SePay) ở bước sau.
