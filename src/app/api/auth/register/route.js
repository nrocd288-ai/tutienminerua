import { NextResponse } from "next/server";
import { findUserByUsername, createUser } from "@/lib/db";
import { hashPassword, signUserToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, phone, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Nhập đầy đủ tên đăng nhập và mật khẩu." },
        { status: 400 }
      );
    }
    if (username.length < 3) {
      return NextResponse.json(
        { error: "Tên đăng nhập cần ít nhất 3 ký tự." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu cần ít nhất 6 ký tự." },
        { status: 400 }
      );
    }
    if (await findUserByUsername(username)) {
      return NextResponse.json(
        { error: "Tên đăng nhập đã được sử dụng." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ username, phone: phone || "", passwordHash });
    const token = signUserToken(user);

    const response = NextResponse.json({
      user: { id: user.id, username: user.username },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Không tạo được tài khoản, thử lại sau." },
      { status: 500 }
    );
  }
}
