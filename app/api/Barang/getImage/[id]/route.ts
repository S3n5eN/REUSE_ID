import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const resolvedParams = await params;
        const imageId = resolvedParams.id;

        const imageData = await prisma.item.findUnique({
            where: { id: Number(imageId) },
        });

        if (!imageData || !imageData.imageData) {
            return new NextResponse("Image not found", { status: 404 });
        }

        return new NextResponse(imageData.imageData, {
            headers: {
                "Content-Type": imageData.imageType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error fetching image:", error);
        return new NextResponse("Gagal mengambil gambar", { status: 500 });
    }
}