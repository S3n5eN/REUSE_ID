import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getPlace(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");

    const places = await prisma.place.findMany({
      where: placeId ? { id: Number(placeId) } : undefined
    });

    return NextResponse.json(places);
  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPlace, ["user", "admin"]))(req);
}