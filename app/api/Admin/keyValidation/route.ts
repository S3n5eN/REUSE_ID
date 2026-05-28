import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { protect } from "@/lib/protect";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function validateKey(req: NextRequest, decoded: { id: string }) {
  try {
    const { keyLocation } = await req.json();

    if (!keyLocation) {
      return NextResponse.json(
        { message: "Key lokasi harus diisi" },
        { status: 400 },
      );
    }

    const containsEmoji = /\p{Extended_Pictographic}/u.test(keyLocation);

    // Ini kalau keyLocation mengandung emoji
    if (containsEmoji) {
      return NextResponse.json(
        { message: "Key lokasi tidak boleh mengandung emoji" },
        { status: 400 },
      );
    }

    // Ini kalau panjang keyLocation kurang dari 4 karakter
    if (keyLocation.length < 4) {
      return NextResponse.json(
        { message: "Key lokasi minimal terdiri dari 4 karakter" },
        { status: 400 },
      );
    }

    // Ini kalau panjang keyLocation lebih dari 10 karakter
    if (keyLocation.length > 12) {
      return NextResponse.json(
        { message: "Key lokasi maksimal terdiri dari 12 karakter" },
        { status: 400 },
      );
    }

    const places = await prisma.place.findMany({
      select: {
        id: true,
        keyLocation: true,
      },
    });

    const place = await Promise.all(
      places.map(async (p) => {
        const isValid = await bcrypt.compare(keyLocation, p.keyLocation);
        return isValid ? p : null;
      }),
    ).then((results) => results.find((p) => p !== null));

    if (!place) {
      return NextResponse.json(
        { message: "Key lokasi tidak valid" },
        { status: 401 },
      );
    }

    const response = NextResponse.json(
      { message: "Key lokasi valid" },
      { status: 200 },
    );

    const adminType = place.id !== 1 ? "DAERAH" : "PUSAT";

    const newToken = await new SignJWT({
      id: Number(decoded.id),
      role: "admin",
      name: (decoded as any).name || "Admin",
      placeId: place.id,
      adminType: adminType,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);
    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 60 * 60,
      path: "/",
    });

    // Ini buat menghapus placeId dan adminType di cookies, karena sekarang kita pake jwt buat nyimpen informasi admin dan placeId
    response.cookies.delete("placeId");
    response.cookies.delete("adminType");

    return response;
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memproses permintaan" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return (await protect(validateKey, ["admin"]))(req);
}
