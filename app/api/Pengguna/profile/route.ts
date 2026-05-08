import { prisma } from "@/lib/prisma";
import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getProfile(req: NextRequest, decoded: { id: string }) {
  try {
    const userId = Number(decoded.id);

    const user = await prisma.userProfile.findFirst({
      where: { id : userId},
    });

    return NextResponse.json({
      message: "Berhasil mengambil data profile",
      data: user
    });

  } catch (error: any) {
    console.error("ERROR GET PROFILE:", error);

    return NextResponse.json(
      { message: "Gagal mengambil profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getProfile, ["user"]))(req);
}