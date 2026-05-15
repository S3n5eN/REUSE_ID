import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { protect } from "@/lib/protect";
import { NextRequest } from "next/server";

async function getItemById(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { message: "itemId wajib diisi" },
        { status: 400 }
      );
    }

    if (isNaN(Number(itemId))) {
      return NextResponse.json(
        { message: "itemId harus angka" },
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({
      where: {
        id: Number(itemId),
      },
      include: {
        user: true,
        place: true
      }
    });

    if (!item) {
      return NextResponse.json(
        { message: "Item tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);

  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getItemById, ["user"]))(req);
}