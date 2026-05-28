import { prisma } from "@/lib/prisma";
import { pengguna } from "@/types/pengguna";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { authRateLimit } from "@/lib/rateLimit";

// ==== karena sekarang pake jose, pake perlu encoder karena jose butuh format Uint8Array untuk secret key ====
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// ==== Ini Method Login Pengguna & Admin ====
export async function POST(req: Request) {
  try {
    const indentifier =
      req.headers.get("x-indenifier-for")?.split(",")[0] || "uknown";
    const { success } = await authRateLimit.limit(indentifier);

    if (!success) {
      return NextResponse.json(
        { message: `Terlalu banyak mencoba, silahkan coba lagi nanti` },
        { status: 429 },
      );
    }

    const body: Pick<pengguna, "email" | "password"> = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Data tidak lengkap, silahkan isi data" },
        { status: 400 },
      );
    }

    // Validasi email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const emailContainsEmoji = /\p{Extended_Pictographic}/u.test(body.email);

    // Ini kalau email ada emoji
    if (emailContainsEmoji) {
      return NextResponse.json(
        { error: "Email tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau email lebih dari 50 karakter
    if (body.email.length > 50) {
      return NextResponse.json(
        { error: "Email maksimal terdiri dari 50 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau email bukan @gmail.com
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          error:
            "Format email tidak valid (harus menggunakan domain @gmail.com)",
        },
        { status: 400 },
      );
    }

    // Validasi password
    const containsEmoji = /\p{Extended_Pictographic}/u.test(body.password);

    // Ini kalau password ada emoji
    if (containsEmoji) {
      return NextResponse.json(
        { error: "Password tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau password kurang dari 8 karakter
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal terdiri dari 8 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau password lebih dari 64 karakter
    if (body.password.length > 64) {
      return NextResponse.json(
        { error: "Password maksimal terdiri dari 64 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau password tidak mengandung huruf besar
    if (!/[A-Z]/.test(body.password)) {
      return NextResponse.json(
        { error: "Password harus mengandung minimal 1 huruf besar" },
        { status: 400 },
      );
    }

    const [admin, user] = await Promise.all([
      prisma.admin.findUnique({ where: { email: body.email } }),
      prisma.user.findUnique({ where: { email: body.email } }),
    ]);

    const isAdmin = !!admin; // Verifikasi apakah akun ini adalah admin atau user
    const account = isAdmin ? admin : user;

    if (!account) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(body.password, account.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }
    // ==== Kita ganti dengan jose ====
    const token = await new SignJWT({
      id: account.id,
      role: isAdmin ? "admin" : "user",
      name: account.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h") // sengaja biar kita bisa cek apakah token bisa expited atau enggak
      .sign(secret);

    const response = NextResponse.json({
      message: "Login berhasil",
      role: isAdmin ? "admin" : "user",
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
