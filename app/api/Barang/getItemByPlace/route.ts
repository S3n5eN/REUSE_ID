import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { protect } from "@/lib/protect";
import { NextRequest } from "next/server";

async function getItemByPlace(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");

    if (!placeId || isNaN(Number(placeId))) {
      return NextResponse.json(
        { message: "placeId wajib diisi dan harus angka" },
        { status: 400 }
      );
    }

    const items = await prisma.item.findMany({
      where: { placeId: Number(placeId),
      status: "Tersedia",
    },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
        quality: true,
      
      }
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getItemByPlace, ["admin"]))(req);
}