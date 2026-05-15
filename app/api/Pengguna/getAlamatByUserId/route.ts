import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { protect } from "@/lib/protect";

async function getAlamat(req: Request, payload: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        userProfile: true
      }
    });

    if (!user || !user.userProfile) {
      return NextResponse.json(
        { message: "Alamat tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lat: user.userProfile.latitude,
      lng: user.userProfile.longitude,
      address: user.userProfile.address
    });

  } catch {
    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getAlamat, ["user"]))(req);
}