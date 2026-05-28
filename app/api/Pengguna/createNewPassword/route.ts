import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token dan password harus diisi" },
        { status: 400 },
      );
    }

    // Validasi format password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    const containsEmoji = /\p{Extended_Pictographic}/u.test(newPassword);

    // ini kalau password mengandung emoji
    if (containsEmoji) {
      return NextResponse.json(
        { message: "Password tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // ini kalau password panjangnya kurang dari 8 karakter
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password minimal terdiri dari 8 karakter" },
        { status: 400 },
      );
    }

    // ini kalau password panjangnya lebih dari 64 karakter
    if (newPassword.length > 64) {
      return NextResponse.json(
        { message: "Password maksimal terdiri dari 64 karakter" },
        { status: 400 },
      );
    }

    // ini kalau password tidak mengandung huruf kecil, huruf besar, dan angka
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          message:
            "Password harus mengandung huruf kecil, huruf besar, dan angka",
        },
        { status: 400 },
      );
    }

    // Alur yang lebih aman:
    const deletedToken = await prisma.passwordReset
      .delete({
        where: { token: token },
      })
      .catch(() => null); // Tangkap error jika record tidak ditemukan

    if (!deletedToken) {
      return NextResponse.json(
        { message: "Token tidak valid atau sudah digunakan" },
        { status: 400 },
      );
    }

    // Cek kedaluwarsa setelah data berhasil ditarik (dan dihapus dari DB)
    if (deletedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Token telah kedaluwarsa" },
        { status: 400 },
      );
    }

    // Baru kemudian update password user
    await prisma.user.update({
      where: { email: deletedToken.email },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });

    return NextResponse.json(
      { message: "Password berhasil direset" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Gagal mereset password" },
      { status: 500 },
    );
  }
}
