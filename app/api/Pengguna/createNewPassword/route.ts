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

    const checkExpired = await prisma.passwordReset.findFirst({
      where: {
        token,
      },
    });

    if (!checkExpired) {
      return NextResponse.json(
        { message: "Token tidak valid" },
        { status: 400 },
      );
    }

    if (checkExpired?.expiresAt < new Date(Date.now())) {
      return NextResponse.json(
        { message: "Token telah kedaluwarsa" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: {
        email: checkExpired.email,
      },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    });

    await prisma.passwordReset.delete({
      where: {
        token,
      },
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
