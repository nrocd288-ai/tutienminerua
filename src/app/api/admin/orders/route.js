import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { listAllOrders } from "@/lib/db";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const payload = verifyToken(token);
  return payload && payload.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }
  const orders = await listAllOrders();
  return NextResponse.json({ orders });
}
