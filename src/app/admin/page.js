"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Check, X, RefreshCw } from "lucide-react";
import { formatVnd } from "@/lib/config";

const STATUS_LABEL = {
  pending: { text: "Chưa báo thanh toán", color: "text-[var(--muted)]" },
  marked_paid: { text: "Khách báo đã chuyển", color: "text-[var(--gold)]" },
  confirmed: { text: "Đã xác nhận", color: "text-[var(--jade-light)]" },
  rejected: { text: "Đã từ chối", color: "text-[var(--danger)]" },
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
      setAuthed(true);
    } else {
      setAuthed(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      loadOrders();
    } else {
      const data = await res.json();
      setLoginError(data.error || "Sai mật khẩu.");
    }
  }

  async function handleAction(orderId, action) {
    setActingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadOrders();
      }
    } finally {
      setActingId(null);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] p-6"
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={20} className="text-[var(--jade-light)]" />
            <h1 className="font-display text-xl">Trang quản trị</h1>
          </div>
          <p className="text-sm text-[var(--muted)] mb-5">
            Nhập mật khẩu quản trị để xác nhận đơn hàng.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu quản trị"
            className="w-full h-10 rounded-md bg-[var(--surface-2)] border border-[var(--border-soft)] px-3 text-sm outline-none focus:border-[var(--jade)] transition-colors mb-3"
          />
          {loginError && (
            <p className="text-sm text-[var(--danger)] mb-3">{loginError}</p>
          )}
          <button className="w-full h-10 rounded-md bg-[var(--jade)] text-[#06140d] font-medium text-sm hover:bg-[var(--jade-light)] transition-colors">
            Vào trang quản trị
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-[var(--jade-light)]" />
          <h1 className="font-display text-xl">Danh sách đơn hàng</h1>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm h-9 px-3 rounded-md border border-[var(--border-soft)] hover:border-[var(--jade)]/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-[var(--muted)] text-center py-12">
          Chưa có đơn hàng nào.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((order) => {
            const status = STATUS_LABEL[order.status] || STATUS_LABEL.pending;
            return (
              <div
                key={order.id}
                className="rounded-lg bg-[var(--surface)] border border-[var(--border-soft)] p-4 flex flex-wrap items-center gap-4"
              >
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-medium">{order.username}</p>
                  <p className="text-xs text-[var(--muted)] font-mono">{order.content}</p>
                </div>
                <div className="text-sm">
                  <p>{order.packageDays} ngày</p>
                  <p className="text-[var(--jade-light)] font-medium">
                    {formatVnd(order.amount)}
                  </p>
                </div>
                <div className={`text-sm font-medium ${status.color} min-w-[160px]`}>
                  {status.text}
                </div>
                <div className="flex gap-2">
                  {order.status !== "confirmed" && order.status !== "rejected" && (
                    <>
                      <button
                        onClick={() => handleAction(order.id, "confirm")}
                        disabled={actingId === order.id}
                        className="flex items-center gap-1 text-sm h-8 px-3 rounded-md bg-[var(--jade)] text-[#06140d] font-medium hover:bg-[var(--jade-light)] transition-colors disabled:opacity-50"
                      >
                        <Check size={14} />
                        Xác nhận
                      </button>
                      <button
                        onClick={() => handleAction(order.id, "reject")}
                        disabled={actingId === order.id}
                        className="flex items-center gap-1 text-sm h-8 px-3 rounded-md border border-[var(--border-soft)] hover:border-[var(--danger)]/50 transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                        Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
