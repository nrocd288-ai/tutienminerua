"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AuthModal({ mode, onModeChange, onClose, onSuccess }) {
  const [form, setForm] = useState({ username: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, thử lại sau.");
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError("Không kết nối được, thử lại sau.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] p-6 relative">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <X size={18} />
        </button>

        <h2 className="font-display text-xl mb-1">
          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </h2>
        <p className="text-sm text-[var(--muted)] mb-5">
          {mode === "login"
            ? "Vào tài khoản để quản lý thời gian treo máy."
            : "Tạo tài khoản để bắt đầu thuê treo máy."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-[var(--muted)] block mb-1.5">
              Tên đăng nhập
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              placeholder="vd: thienha99"
              className="w-full h-10 rounded-md bg-[var(--surface-2)] border border-[var(--border-soft)] px-3 text-sm outline-none focus:border-[var(--jade)] transition-colors"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-xs text-[var(--muted)] block mb-1.5">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="vd: 0912345678"
                className="w-full h-10 rounded-md bg-[var(--surface-2)] border border-[var(--border-soft)] px-3 text-sm outline-none focus:border-[var(--jade)] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-[var(--muted)] block mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="ít nhất 6 ký tự"
              className="w-full h-10 rounded-md bg-[var(--surface-2)] border border-[var(--border-soft)] px-3 text-sm outline-none focus:border-[var(--jade)] transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)] -mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-md bg-[var(--jade)] text-[#06140d] font-medium text-sm mt-1 hover:bg-[var(--jade-light)] transition-colors disabled:opacity-60"
          >
            {loading
              ? "Đang xử lý..."
              : mode === "login"
              ? "Đăng nhập"
              : "Tạo tài khoản"}
          </button>
        </form>

        <p className="text-sm text-[var(--muted)] mt-4 text-center">
          {mode === "login" ? (
            <>
              Chưa có tài khoản?{" "}
              <button
                onClick={() => onModeChange("register")}
                className="text-[var(--jade-light)] hover:underline"
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <button
                onClick={() => onModeChange("login")}
                className="text-[var(--jade-light)] hover:underline"
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
