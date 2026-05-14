import { protect } from "@/lib/protect";
import { NextRequest, NextResponse } from "next/server";

async function getAdminProfile(req: NextRequest, decoded: { id: number; name: string }) {
  try {
    const adminType = req.cookies.get("adminType")?.value;

    if (!adminType) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
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