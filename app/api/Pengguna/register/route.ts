import { prisma } from "@/lib/prisma";
import { pengguna } from "@/types/pengguna";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { authRateLimit } from "@/lib/rateLimit";

// ==== Ini Method Register Pengguna ====
export async function POST(req: Request) {
  try {
    const identifier =
      req.headers.get("x-indetifier-for")?.split(",")[0] || "unknown";
    const { success } = await authRateLimit.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { message: `Terlalu banyak mencoba, silahkan coba lagi nanti` },
        { status: 429 },
      );
    }

    const body: Pick<pengguna, "name" | "email" | "password"> =
      await req.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { message: "Data tidak lengkap, silahkan isi data" },
        { status: 400 },
      );
    }

    // Validasi nama lengkap
    if (!body.name.trim()) {
      return NextResponse.json(
        { message: "Nama tidak boleh kosong" },
        { status: 400 },
      );
    }

    // ini kalau nama mengandung angka atau simbol
    if (!/^[A-Za-z\s]+$/.test(body.name)) {
      return NextResponse.json(
        { message: "Nama hanya boleh huruf alfabet (A-Z)" },
        { status: 400 },
      );
    }

    // ini kalau panjang nama kurang dari 4 karakter
    if (body.name.length < 4) {
      return NextResponse.json(
        { message: "Nama minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // ini kalau panjang nama lebih dari 30 karakter
    if (body.name.length > 30) {
      return NextResponse.json(
        { message: "Nama maksimal terdiri dari 30 karakter" },
        { status: 400 },
      );
    }

    // Validasi email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const emailContainsEmoji = /\p{Extended_Pictographic}/u.test(body.email);

    // ini kalau email mengandung emoji
    if (emailContainsEmoji) {
      return NextResponse.json(
        { message: "Email tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // ini kalau panjang email lebih dari 50 karakter
    if (body.email.length > 50) {
      return NextResponse.json(
        { message: "Email maksimal terdiri dari 50 karakter" },
        { status: 400 },
      );
    }

    // ini kalau email bukan @gmail.com
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          message:
            "Format email tidak valid (harus menggunakan domain @gmail.com)",
        },
        { status: 400 },
      );
    }

    // Validasi password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    const containsEmoji = /\p{Extended_Pictographic}/u.test(body.password);

    //  INi kalau password ada emoji
    if (containsEmoji) {
      return NextResponse.json(
        { message: "Password tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // ini kalau panjang password kurang dari 8
    if (body.password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal terdiri dari 8 karakter" },
        { status: 400 },
      );
    }

    // ini kalau panjang password lebih dari 64
    if (body.password.length > 64) {
      return NextResponse.json(
        { message: "Password maksimal terdiri dari 64 karakter" },
        { status: 400 },
      );
    }

    // ini kalau password tidak mengandung huruf kecil, huruf besar, dan angka
    if (!passwordRegex.test(body.password)) {
      return NextResponse.json(
        {
          message:
            "Password harus mengandung huruf kecil, huruf besar, dan angka",
        },
        { status: 400 },
      );
    }

    const isUserExist = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });

    if (isUserExist) {
      return NextResponse.json(
        { message: "User sudah terdaftar, silahkan ke halaman login" },
        { status: 400 },
      );
    }

    const hashPassword = await bcrypt.hash(body.password, 10);
    await prisma.user.create({
      data: { name: body.name, email: body.email, password: hashPassword },
    });
    return NextResponse.json(
      { message: "User berhasil registrasi" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
