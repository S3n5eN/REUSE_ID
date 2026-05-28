import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getAdminProfile(req: NextRequest, decoded: { id: number; name: string; adminType?: string }) {
  try {
    const adminType = decoded.adminType;

    if (!adminType) {
      return NextResponse.json({ message: "Belum login atau divalidasi lokasi" }, { status: 401 });
    }

    return NextResponse.json(
      { name: decoded.name, type: adminType },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return (await protect(getAdminProfile, ["admin"]))(req);
}