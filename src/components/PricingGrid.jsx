"use client";

import { CalendarDays, CalendarRange, Calendar, CalendarClock } from "lucide-react";
import { formatVnd } from "@/lib/config";

const ICONS = {
  "ti-calendar-event": CalendarDays,
  "ti-calendar-week": CalendarRange,
  "ti-calendar-month": Calendar,
  "ti-calendar-stats": CalendarClock,
};

export default function PricingGrid({ packages, onSelect, selectedDays, loading }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {packages.map((pkg) => {
        const Icon = ICONS[pkg.icon] || Calendar;
        const isSelected = selectedDays === pkg.days;
        return (
          <div
            key={pkg.days}
            className={`relative rounded-lg p-4 flex flex-col bg-[var(--surface)] border transition-colors ${
              pkg.featured
                ? "border-[var(--jade)]"
                : "border-[var(--border-soft)]"
            }`}
          >
            {pkg.featured && (
              <span className="absolute -top-2.5 left-3 bg-[var(--jade)] text-[#06140d] text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                Phổ biến
              </span>
            )}
            <Icon
              size={20}
              strokeWidth={1.75}
              className={pkg.featured ? "text-[var(--jade-light)]" : "text-[var(--muted)]"}
            />
            <p className="text-sm text-[var(--muted)] mt-2.5">{pkg.label}</p>
            <p className="font-display text-xl mt-0.5 mb-3.5">{formatVnd(pkg.price)}</p>
            <button
              onClick={() => onSelect(pkg.days)}
              disabled={loading}
              className={`mt-auto h-9 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                isSelected
                  ? "bg-[var(--jade)] text-[#06140d]"
                  : "border border-[var(--border-soft)] hover:border-[var(--jade)]/50"
              }`}
            >
              {loading && isSelected ? "Đang tạo..." : isSelected ? "Đã chọn" : "Chọn gói"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
