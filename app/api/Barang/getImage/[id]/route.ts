import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Buffer } from "buffer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const imageId = Number(resolvedParams.id);

    const imageData = await prisma.item.findUnique({
      where: { id: imageId },
      select: { id: true, imageData: true, imageType: true, createdAt: true },
    });

    if (!imageData || !imageData.imageData) {
      return new NextResponse("Image not found", {
        status: 404,
      });
    }

    const etag = `W/"${imageData.id}-${new Date(imageData.createdAt).getTime()}"`;

    const ifNoneMatch = req.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache",
          Etag: etag,
        },
      });
    }

    return new NextResponse(Buffer.from(imageData.imageData), {
      headers: {
        "Content-Type": imageData.imageType || "image/webp",
        "Cache-Control": "no-cache",
        ETag: etag,
      },
    });
  } catch (error) {
    console.error(error);

    return new NextResponse("Gagal mengambil gambar", {
      status: 500,
    });
  }
}
