"use client";

import { useEffect, useState, useCallback } from "react";
import { Swords } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import PricingGrid from "@/components/PricingGrid";
import AuthModal from "@/components/AuthModal";
import PaymentCard from "@/components/PaymentCard";
import StatusCard from "@/components/StatusCard";
import { RENTAL_PACKAGES } from "@/lib/config";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState(null);

  const [selectedDays, setSelectedDays] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const refreshUser = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user);
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function handleSelectPackage(days) {
    if (!user) {
      setAuthMode("login");
      return;
    }
    setSelectedDays(days);
    setOrderLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderData(data);
        document
          .getElementById("payment-card")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } finally {
      setOrderLoading(false);
    }
  }

  async function handleMarkPaid() {
    if (!orderData) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/orders/${orderData.order.id}/mark-paid`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setOrderData((prev) => ({ ...prev, order: data.order }));
      }
    } finally {
      setMarking(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    setUser(null);
    setOrderData(null);
    setSelectedDays(null);
  }

  function handleAuthSuccess() {
    setAuthMode(null);
    refreshUser();
  }

  return (
    <div className="flex-1 flex flex-col">
      <SiteHeader user={user} onAuthClick={setAuthMode} onLogout={handleLogout} />

      <main className="mx-auto max-w-5xl w-full px-5 py-10">
        <section className="text-center py-8 sm:py-12">
          <Swords
            size={28}
            strokeWidth={1.5}
            className="mx-auto mb-4 text-[var(--jade-light)]"
          />
          <h1 className="font-display text-3xl sm:text-4xl mb-3 leading-tight">
            Treo máy tu luyện, không cần mở máy
          </h1>
          <p className="text-[var(--muted)] max-w-md mx-auto text-sm sm:text-base">
            Auto cày 24/7 trên máy chủ riêng. Chọn số ngày, quét QR thanh toán,
            đạo hữu chỉ cần đăng nhập game khi muốn xem tiến độ.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl mb-4">Bảng giá thuê theo ngày</h2>
          <PricingGrid
            packages={RENTAL_PACKAGES}
            onSelect={handleSelectPackage}
            selectedDays={selectedDays}
            loading={orderLoading}
          />
        </section>

        {!checkingAuth && !user && (
          <section className="mb-10 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-6 text-center">
            <p className="text-sm text-[var(--muted)] mb-3">
              Đăng nhập để chọn gói và thanh toán.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setAuthMode("login")}
                className="h-9 px-4 rounded-md border border-[var(--border-soft)] text-sm hover:border-[var(--jade)]/50 transition-colors"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className="h-9 px-4 rounded-md bg-[var(--jade)] text-[#06140d] text-sm font-medium hover:bg-[var(--jade-light)] transition-colors"
              >
                Đăng ký
              </button>
            </div>
          </section>
        )}

        {user && (
          <section className="mb-10">
            <PaymentCard
              order={orderData?.order}
              qrDataUrl={orderData?.qrDataUrl}
              bank={orderData?.bank}
              onMarkPaid={handleMarkPaid}
              marking={marking}
            />
          </section>
        )}

        {user && (
          <section>
            <StatusCard user={user} />
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--border-soft)] py-6 text-center text-xs text-[var(--muted)]">
        Túc Mệnh Cốc · Dịch vụ treo máy tu luyện
      </footer>

      {authMode && (
        <AuthModal
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
