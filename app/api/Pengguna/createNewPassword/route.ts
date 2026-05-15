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

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password harus memiliki minimal 8 karakter" },
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
