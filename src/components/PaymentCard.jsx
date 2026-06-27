"use client";

import { QrCode, Info, CheckCircle2, Clock } from "lucide-react";
import { formatVnd } from "@/lib/config";

export default function PaymentCard({ order, qrDataUrl, bank, onMarkPaid, marking }) {
  return (
    <div id="payment-card" className="rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <QrCode size={18} strokeWidth={1.75} className="text-[var(--jade-light)]" />
        <h3 className="font-display text-lg">Nạp tiền / thanh toán</h3>
      </div>

      {!order ? (
        <div className="text-center py-10 text-[var(--muted)] text-sm">
          <QrCode size={28} strokeWidth={1.5} className="mx-auto mb-2 opacity-50" />
          Chọn một gói ở trên để tạo mã QR thanh toán.
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)] mb-4">
            Quét mã QR bằng app ngân hàng hoặc ví điện tử, số tiền và nội dung đã tự điền sẵn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white rounded-md p-2 w-fit mx-auto sm:mx-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Mã QR thanh toán" width={180} height={180} />
            </div>
            <div className="flex-1 text-sm">
              <Row label="Ngân hàng" value={bank.bankName} />
              <Row label="Số tài khoản" value={bank.accountNumber} />
              <Row label="Chủ tài khoản" value={bank.accountName} />
              <Row label="Gói đã chọn" value={`${order.packageDays} ngày`} strong />
              <Row label="Số tiền" value={formatVnd(order.amount)} strong accent />
              <Row label="Nội dung CK" value={order.content} mono />
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] flex items-start gap-1.5 mt-4">
            <Info size={14} className="mt-0.5 shrink-0" />
            Chuyển đúng nội dung để hệ thống dễ đối soát. Sau khi admin xác nhận, số ngày sẽ tự cộng vào tài khoản của bạn.
          </p>

          {order.status === "pending" && (
            <button
              onClick={onMarkPaid}
              disabled={marking}
              className="w-full h-10 rounded-md border border-[var(--border-soft)] hover:border-[var(--jade)]/50 text-sm font-medium mt-4 transition-colors disabled:opacity-60"
            >
              {marking ? "Đang gửi..." : "Tôi đã chuyển khoản"}
            </button>
          )}
          {order.status === "marked_paid" && (
            <div className="flex items-center gap-2 text-sm text-[var(--gold)] mt-4 bg-[var(--surface-2)] rounded-md px-3 py-2.5">
              <Clock size={16} />
              Đang chờ admin xác nhận đã nhận tiền.
            </div>
          )}
          {order.status === "confirmed" && (
            <div className="flex items-center gap-2 text-sm text-[var(--jade-light)] mt-4 bg-[var(--surface-2)] rounded-md px-3 py-2.5">
              <CheckCircle2 size={16} />
              Đã xác nhận, ngày treo máy đã được cộng vào tài khoản.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, strong, accent, mono }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[var(--border-soft)] last:border-0">
      <span className="text-[var(--muted)]">{label}</span>
      <span
        className={`text-right ${strong ? "font-medium" : ""} ${
          accent ? "text-[var(--jade-light)]" : ""
        } ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
