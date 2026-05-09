import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

interface JwtPayload {
    id: number;
    role: "admin" | "user";
    name: string;
}

// ==== Ini buat dapetin id, dan nama user yang login ====
export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret) as { payload: JwtPayload };

        const isVerified = await prisma.userProfile.findFirst({
        where: { userId: Number(payload.id)},
        select: { isVerified: true },
    })

        return NextResponse.json({ id: payload.id, name: payload.name, isVerified });
    } catch  {
        return NextResponse.json({ message: "Token tidak valid" }, { status: 401 });
    }
}