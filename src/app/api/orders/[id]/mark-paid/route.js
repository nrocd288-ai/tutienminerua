import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { markOrderPaid } from "@/lib/db";

export async function PATCH(request, { params }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload || payload.role !== "user") {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước." }, { status: 401 });
  }

  const { id } = await params;
  const order = await markOrderPaid(parseInt(id, 10), payload.userId);
  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }
  return NextResponse.json({ order });
}
