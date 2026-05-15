import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { protect } from "@/lib/protect";
import { NextRequest } from "next/server";

async function getItem(req: Request) {
  try {
    const items = await prisma.item.findMany({
      include: {
        place: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getItem, ["user"]))(req);
}
