import { NextRequest, NextResponse } from "next/server";
import { protect } from "@/lib/protect";

async function getPlaceId(req: NextRequest) {
  const placeId = req.cookies.get("placeId")?.value;
  return NextResponse.json({
    placeId: placeId ? Number(placeId) : null,
    isGeneral: !placeId || placeId === "",
  });
}

export async function GET(req: NextRequest) {
  return (await protect(getPlaceId, ["admin"]))(req);
}