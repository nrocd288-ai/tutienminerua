"use client";

import { Sword } from "lucide-react";

export default function SiteHeader({ user, onAuthClick, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sword size={20} className="text-[var(--jade-light)]" strokeWidth={1.75} />
          <span className="font-display text-lg tracking-wide">Túc Mệnh Cốc</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm leading-tight">{user.username}</p>
              <p
                className={`text-xs leading-tight ${
                  user.isActive ? "text-[var(--jade-light)]" : "text-[var(--muted)]"
                }`}
              >
                {user.isActive ? `Còn ${user.rentalDaysLeft} ngày` : "Chưa kích hoạt"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-sm px-3.5 h-9 rounded-md border border-[var(--border-soft)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--jade)]/50 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onAuthClick("login")}
              className="text-sm px-3.5 h-9 rounded-md border border-[var(--border-soft)] hover:border-[var(--jade)]/50 transition-colors"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => onAuthClick("register")}
              className="text-sm px-3.5 h-9 rounded-md bg-[var(--jade)] text-[#06140d] font-medium hover:bg-[var(--jade-light)] transition-colors"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
