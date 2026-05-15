import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getNotifikasi(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);

    const news = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        caption:true,
        createdAt: true,
        newsRead: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const result = news.map((n) => ({
      id: n.id,
      title: n.title,
      caption: n.caption,
      createdAt: n.createdAt,
      isRead: n.newsRead.length > 0,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getNotifikasi, ["user"]))(req);
}