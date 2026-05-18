import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Buffer } from "buffer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const imageId = Number(resolvedParams.id);

    const imageData = await prisma.item.findUnique({
      where: { id: imageId },
    });

    if (!imageData || !imageData.imageData) {
      return new NextResponse("Image not found", {
        status: 404,
      });
    }

    return new NextResponse(Buffer.from(imageData.imageData), {
      headers: {
        "Content-Type": imageData.imageType || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(error);

    return new NextResponse("Gagal mengambil gambar", {
      status: 500,
    });
  }
}