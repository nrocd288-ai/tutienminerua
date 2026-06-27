import { NextResponse } from "next/server";
import { checkAdminPassword, signAdminToken } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Sai mật khẩu quản trị." }, { status: 401 });
  }
  const token = signAdminToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
