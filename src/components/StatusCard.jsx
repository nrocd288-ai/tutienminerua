"use client";

import { Activity, CalendarCheck, CalendarX } from "lucide-react";

export default function StatusCard({ user }) {
  if (!user) return null;

  const expiresLabel = user.rentalExpiresAt
    ? new Date(user.rentalExpiresAt).toLocaleDateString("vi-VN")
    : "—";

  return (
    <div className="rounded-lg bg-[var(--surface-2)] px-5 py-4">
      <p className="font-display text-base mb-3">Trạng thái treo máy</p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">Trạng thái</p>
          <p
            className={`text-sm font-medium flex items-center gap-1.5 ${
              user.isActive ? "text-[var(--jade-light)]" : "text-[var(--muted)]"
            }`}
          >
            <Activity size={14} />
            {user.isActive ? "Đang treo" : "Chưa kích hoạt"}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">Ngày còn lại</p>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <CalendarCheck size={14} />
            {user.rentalDaysLeft} ngày
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--muted)] mb-1">Hết hạn</p>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <CalendarX size={14} />
            {expiresLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
