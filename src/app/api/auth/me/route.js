import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "user") {
    return NextResponse.json({ user: null });
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const now = new Date();
  const expiresAt = user.rentalExpiresAt ? new Date(user.rentalExpiresAt) : null;
  const daysLeft =
    expiresAt && expiresAt > now
      ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24))
      : 0;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      rentalExpiresAt: user.rentalExpiresAt,
      rentalDaysLeft: daysLeft,
      isActive: daysLeft > 0,
    },
  });
}
