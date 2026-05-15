import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/lib/protect";

async function getPlaceId(req: NextRequest) {
  try {
    const placeId = req.cookies.get("placeId")?.value;

    if (!placeId) {
      return NextResponse.json(
        { message: "Place ID tidak ditemukan, pastikan sudah melakukan validasi key lokasi" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      placeId: placeId ? Number(placeId) : null,
      isGeneral: !placeId || placeId === "",
    });
  } catch {
    return NextResponse.json(
      {
        message: "Gagal mengambil place ID",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getPlaceId, ["admin"]))(req);
}
