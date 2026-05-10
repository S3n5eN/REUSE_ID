import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function bacaNotifikasi(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);
    const body = await req.json();
    const newsId = Number(body.newsId);

    if (!newsId) {
      return NextResponse.json({ message: "newsId wajib diisi" }, { status: 400 });
    }

    await prisma.newsRead.upsert({
      where: { userId_newsId: { userId, newsId } },
      update: {},
      create: { userId, newsId },
    });

    return NextResponse.json({ message: "Berhasil" });
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return (await protect(bacaNotifikasi, ["user"]))(req);
}