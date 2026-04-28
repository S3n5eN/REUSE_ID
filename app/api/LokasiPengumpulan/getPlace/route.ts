import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getPlace(req: Request, payload: any) {
  try {
    const places = await prisma.place.findMany();

    return NextResponse.json(places);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPlace, ["user", "admin"]))(req);s
}n