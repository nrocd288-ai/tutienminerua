import "./globals.css";

export const metadata = {
  title: "Túc Mệnh Cốc — Treo máy tu luyện 24/7",
  description:
    "Dịch vụ treo máy auto cày game tu luyện theo ngày. Đăng ký, nạp tiền qua QR, kích hoạt nhanh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
