import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import QRCode from "qrcode";
import { verifyToken } from "@/lib/auth";
import { createOrder, listOrdersForUser } from "@/lib/db";
import { RENTAL_PACKAGES, BANK_INFO, buildTransferContent } from "@/lib/config";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "user") return null;
  return payload;
}

// Sinh nội dung QR theo chuẩn VietQR (EMVCo) để app ngân hàng tự đọc
// đúng số tiền và nội dung chuyển khoản khi quét.
function buildVietQrPayload({ bankBin, accountNumber, amount, content }) {
  function tlv(id, value) {
    const len = String(value.length).padStart(2, "0");
    return `${id}${len}${value}`;
  }

  const merchantAccount = tlv(
    "00",
    tlv("00", "A000000727") + tlv("01", tlv("00", bankBin) + tlv("01", accountNumber))
  ) + tlv("02", "QRIBFTTA");

  const merchantInfo = tlv("38", merchantAccount);

  let payload = "";
  payload += tlv("00", "01");
  payload += tlv("01", "12");
  payload += merchantInfo;
  payload += tlv("53", "704");
  if (amount) payload += tlv("54", String(amount));
  payload += tlv("58", "VN");
  if (content) {
    payload += tlv("62", tlv("08", content));
  }

  const withCrcPlaceholder = payload + "6304";
  const crc = crc16(withCrcPlaceholder);
  return withCrcPlaceholder + crc;
}

function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export async function POST(request) {
  const payload = await getCurrentUser();
  if (!payload) {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước." }, { status: 401 });
  }

  const { days } = await request.json();
  const pkg = RENTAL_PACKAGES.find((p) => p.days === days);
  if (!pkg) {
    return NextResponse.json({ error: "Gói thuê không hợp lệ." }, { status: 400 });
  }

  const content = buildTransferContent(payload.username, pkg.days);
  const order = await createOrder({
    userId: payload.userId,
    username: payload.username,
    packageDays: pkg.days,
    amount: pkg.price,
    content,
  });

  const qrString = buildVietQrPayload({
    bankBin: BANK_INFO.bankBin,
    accountNumber: BANK_INFO.accountNumber,
    amount: pkg.price,
    content,
  });
const qrDataUrl = "/qr.png";

  return NextResponse.json({ order, qrDataUrl, bank: BANK_INFO });
}

export async function GET() {
  const payload = await getCurrentUser();
  if (!payload) {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước." }, { status: 401 });
  }
  const orders = await listOrdersForUser(payload.userId);
  return NextResponse.json({ orders });
}
