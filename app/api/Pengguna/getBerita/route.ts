import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/lib/protect";

async function getBeritaUser(req: NextRequest) {
  try {
    const news = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        imageType: true,
        createdAt: true,
      },
    });

    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ message: "Gagal mengambil berita" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getBeritaUser, ["user"]))(req);
}