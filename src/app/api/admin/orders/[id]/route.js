import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { confirmOrder, rejectOrder } from "@/lib/db";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload && payload.role === "admin";
}

export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json();
  const orderId = parseInt(id, 10);

  let order;
  if (action === "confirm") {
    order = await confirmOrder(orderId);
  } else if (action === "reject") {
    order = await rejectOrder(orderId);
  } else {
    return NextResponse.json({ error: "Hành động không hợp lệ." }, { status: 400 });
  }

  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
