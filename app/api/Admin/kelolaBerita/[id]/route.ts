import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const imageId = resolvedParams.id;

        const imageBerita = await prisma.news.findUnique({
            where: {
                id: Number(imageId),
            }
        })

        if (!imageBerita) {
            return NextResponse.json({ message: "Berita tidak ditemukan" }, { status: 404 });
        }

        return new NextResponse(imageBerita, {
            headers: {
                "Content-Type": imageBerita.imageType,
                "Cache-Control": "public, max-age=31536000, immutable",
            }
        });
    } catch {
        return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
    }
} 