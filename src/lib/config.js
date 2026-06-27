export const RENTAL_PACKAGES = [
  { days: 1, price: 10000, label: "1 ngày", icon: "ti-calendar-event" },
  { days: 7, price: 65000, label: "7 ngày", icon: "ti-calendar-week" },
  {
    days: 15,
    price: 130000,
    label: "15 ngày",
    icon: "ti-calendar-month",
    featured: true,
  },
  { days: 30, price: 250000, label: "30 ngày", icon: "ti-calendar-stats" },
];

// Đổi đúng thông tin ngân hàng thật của bạn ở đây.
// bankBin: mã ngân hàng theo chuẩn Napas/VietQR — Techcombank là 970407.
// Tham khảo danh sách đầy đủ tại: https://api.vietqr.io/v2/banks
export const BANK_INFO = {
  bankBin: "970407",
  bankName: "Techcombank",
  accountNumber: "0123456789",
  accountName: "NGUYEN VAN A",
};

export function formatVnd(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export function buildTransferContent(username, days) {
  return `${username.toUpperCase()} THUE ${days}NGAY`.slice(0, 24);
}
